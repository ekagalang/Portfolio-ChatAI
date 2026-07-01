import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/dashboard/ui";
import { AuditList } from "@/components/admin/AuditList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log Audit", robots: { index: false } };

export default async function AdminAuditPage() {
  await requireAdmin();
  const tt = t(await getLang());

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows = entries.map((e) => ({
    id: e.id,
    action: e.action,
    actorEmail: e.actorEmail,
    targetId: e.targetId,
    targetEmail: e.targetEmail,
    detail: e.detail,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title={tt.audit.title} subtitle={tt.audit.subtitle} />
      <AuditList rows={rows} />
    </>
  );
}
