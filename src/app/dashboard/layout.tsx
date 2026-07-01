import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Pages di bawah /dashboard yang dipakai bersama (mis. /dashboard/profil)
  // tetap memakai shell sesuai peran agar konsisten.
  const variant = user.role === "admin" ? "admin" : "user";

  // Nudge verifikasi hanya untuk akun password yang belum verifikasi
  // (user Google sudah terverifikasi provider → tidak diganggu).
  const acct = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true, passwordHash: true },
  });
  const showVerify = !!acct && !acct.emailVerified && !!acct.passwordHash;

  return (
    <DashboardShell variant={variant} showVerify={showVerify}>
      {children}
    </DashboardShell>
  );
}
