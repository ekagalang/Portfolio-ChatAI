import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Wajib login — redirect ke /login bila belum. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Wajib admin — redirect ke /login bila belum login, /dashboard bila bukan admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
