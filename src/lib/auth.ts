import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    // Cegah user yang dibekukan login (mis. via Google). Credentials sudah
    // ditolak di authorize(); ini menangkap OAuth & akun existing.
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return true;
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, suspended: true },
      });
      if (dbUser?.suspended) return false;
      if (dbUser) {
        await prisma.user
          .update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } })
          .catch(() => {});
      }
      return true;
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (user.suspended) return null; // akun dibekukan

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
