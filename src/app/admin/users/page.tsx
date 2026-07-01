import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { isAdminEmail } from "@/lib/auth.config";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { UserList } from "@/components/admin/UserList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola User", robots: { index: false } };

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const tt = t(await getLang());

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      suspended: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isAdmin: u.role === "admin" || isAdminEmail(u.email),
    suspended: u.suspended,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    orderCount: u._count.orders,
    hasPassword: !!u.passwordHash,
    isSelf: u.id === me.id,
  }));

  const admins = rows.filter((r) => r.isAdmin).length;

  return (
    <>
      <PageHeader title={tt.users.title} subtitle={tt.users.subtitle} />

      <div className="mb-7 grid grid-cols-3 gap-3">
        <StatCard label={tt.users.total} value={String(rows.length)} />
        <StatCard label={tt.users.admins} value={String(admins)} />
        <StatCard label={tt.users.customers} value={String(rows.length - admins)} />
      </div>

      <UserList users={rows} />
    </>
  );
}
