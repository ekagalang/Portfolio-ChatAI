import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Wajib login — redirect ke /login bila belum. Menolak akun yang dibekukan. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Blokir sesi lama bila akun dibekukan setelah login.
  const db = await prisma.user.findUnique({
    where: { id: user.id },
    select: { suspended: true },
  });
  if (!db || db.suspended) redirect("/login?error=suspended");
  return user;
}

/** Wajib admin — redirect ke /login bila belum login, /dashboard bila bukan admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
