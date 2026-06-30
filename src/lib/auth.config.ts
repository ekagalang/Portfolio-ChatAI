import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Email yang otomatis jadi admin (selain itu = customer)
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Config dasar yang aman untuk Edge runtime (dipakai middleware).
// Provider Credentials + Prisma adapter ditambahkan di auth.ts (Node only).
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google memverifikasi email → aman menautkan ke akun email/password yang sama
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "customer";
      }
      // Profil di-update (mis. ganti nama) → segarkan token tanpa login ulang
      if (trigger === "update" && session && typeof session === "object" && "name" in session) {
        token.name = (session as { name?: string }).name ?? token.name;
      }
      // Override admin via allowlist email (sumber kebenaran peran admin)
      if (token.email && adminEmails.includes(String(token.email).toLowerCase())) {
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
