import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/dashboard/ui";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil", robots: { index: false } };

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  if (!user) notFound();

  const tt = t(await getLang());

  return (
    <>
      <PageHeader title={tt.profil.title} subtitle={tt.profil.subtitle} />
      <ProfileForm
        initialName={user.name ?? ""}
        email={user.email}
        role={user.role}
        hasPassword={!!user.passwordHash}
        memberSince={user.createdAt.toISOString()}
        orderCount={user._count.orders}
      />
    </>
  );
}
