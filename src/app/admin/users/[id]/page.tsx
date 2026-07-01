import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAuditForTarget } from "@/lib/audit";
import { isAdminEmail } from "@/lib/auth.config";
import { formatIDR } from "@/lib/utils";
import { getLang } from "@/lib/i18n.server";
import { dateLocale, t } from "@/lib/i18n";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Panel, SectionLabel, Row } from "@/components/dashboard/ui";
import { UserAdminPanel } from "@/components/admin/UserAdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail User", robots: { index: false } };

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;

  const [user, orders, audit, lang] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        notes: true,
        lastLoginAt: true,
        emailVerified: true,
        passwordHash: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: id },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    }),
    getAuditForTarget(id),
    getLang(),
  ]);
  if (!user) notFound();

  const tt = t(lang);
  const tu = tt.users;
  const isAdmin = user.role === "admin" || isAdminEmail(user.email);
  const isSelf = user.id === me.id;
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString(dateLocale(lang), { day: "numeric", month: "short", year: "numeric" });
  const fmtDateTime = (d: Date) =>
    new Date(d).toLocaleString(dateLocale(lang), {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Link
        href="/admin/users"
        className="mb-5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" /> {tt.nav.users}
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-base font-bold text-accent">
          {initial}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-mono text-xl font-semibold tracking-tight text-foreground">
              {user.name ?? "—"}
            </h1>
            {isAdmin && (
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                admin
              </span>
            )}
            {user.suspended && (
              <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400">
                {tu.frozen}
              </span>
            )}
            <span
              className={
                user.emailVerified
                  ? "rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent"
                  : "rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
              }
            >
              {user.emailVerified ? tu.verified : tu.unverified}
            </span>
          </div>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Panel className="p-5">
            <SectionLabel>{tt.profil.account}</SectionLabel>
            <div className="divide-y divide-border">
              <Row label={tu.status} value={user.suspended ? tu.frozen : tu.active} />
              <Row label={tt.profil.email} value={user.email} />
              <Row label={tu.loginMethod} value={user.passwordHash ? tu.password : tu.google} />
              <Row label={tt.profil.memberSince} value={fmtDate(user.createdAt)} />
              <Row label={tu.lastLogin} value={user.lastLoginAt ? fmtDateTime(user.lastLoginAt) : tu.never} />
              <Row label={tu.orders} value={String(orders.length)} />
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionLabel>{tu.ordersTitle}</SectionLabel>
            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground">{tu.noOrders}</p>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition hover:border-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{o.serviceTitle}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {fmtDate(o.createdAt)}
                        {" · "}
                        {o.agreedTotal != null ? formatIDR(o.agreedTotal) : tt.common.awaitingQuote}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <UserAdminPanel
            userId={user.id}
            name={user.name}
            email={user.email}
            suspended={user.suspended}
            hasPassword={!!user.passwordHash}
            initialNotes={user.notes ?? ""}
            canAct={!isAdmin && !isSelf}
          />

          <Panel className="p-5">
            <SectionLabel>{tu.auditTitle}</SectionLabel>
            {audit.length === 0 ? (
              <p className="text-xs text-muted-foreground">{tu.noAudit}</p>
            ) : (
              <ol className="space-y-3">
                {audit.map((a) => (
                  <li key={a.id} className="border-l-2 border-border pl-3">
                    <p className="text-xs font-medium text-foreground">
                      {tu.auditActions[a.action] ?? a.action}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {fmtDateTime(a.createdAt)} · {tu.by} {a.actorEmail}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
