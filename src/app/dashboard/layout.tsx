import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Pages di bawah /dashboard yang dipakai bersama (mis. /dashboard/profil)
  // tetap memakai shell sesuai peran agar konsisten.
  const variant = user.role === "admin" ? "admin" : "user";
  return <DashboardShell variant={variant}>{children}</DashboardShell>;
}
