import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getOrderById } from "@/lib/orders";
import { getTicketsForOrder } from "@/lib/tickets";
import { AdminTicketActions } from "@/components/admin/AdminTicketActions";
import { formatIDR, orderLabel } from "@/lib/utils";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { Panel, SectionLabel, Row } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Order", robots: { index: false } };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const tt = t(await getLang());
  const tickets = (await getTicketsForOrder(order.id)).map((tc) => ({
    id: tc.id,
    type: tc.type,
    message: tc.message,
    status: tc.status,
    response: tc.response,
    createdAt: tc.createdAt.toISOString(),
  }));
  const total = order.agreedTotal ?? 0;
  const dp = order.dpAmount ?? 0;

  return (
    <>
      <Link href="/admin" className="mb-5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition hover:text-foreground">
        <ChevronLeft className="size-3.5" /> {tt.nav.admin}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">{order.serviceTitle}</h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{orderLabel(order)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: info */}
        <div className="space-y-4 lg:col-span-3">
          <Panel className="p-5">
            <SectionLabel>{tt.admin.customer}</SectionLabel>
            <div className="divide-y divide-border">
              <Row label={tt.admin.name} value={order.user.name ?? "—"} />
              <Row label={tt.admin.email} value={order.user.email} />
              {order.phone && <Row label={tt.admin.phone} value={order.phone} />}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionLabel>{tt.order.brief}</SectionLabel>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{order.brief}</p>
          </Panel>

          {order.agreedTotal != null && (
            <Panel className="p-5">
              <SectionLabel>{tt.admin.price}</SectionLabel>
              <div className="divide-y divide-border">
                <Row label={tt.common.total} value={formatIDR(total)} />
                <Row label={tt.common.dp} value={formatIDR(dp)} />
                <Row label={tt.admin.remaining} value={formatIDR(Math.max(0, total - dp))} />
              </div>
              <a
                href={`/api/orders/${order.id}/invoice`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
              >
                <FileText className="size-4" /> {tt.invoice.download}
              </a>
            </Panel>
          )}

          {order.payments.length > 0 && (
            <Panel className="p-5">
              <SectionLabel>{tt.order.payment}</SectionLabel>
              <div className="divide-y divide-border">
                {order.payments.map((pm) => (
                  <Row
                    key={pm.id}
                    label={`${pm.type === "dp" ? tt.common.dp : tt.order.settlement} · ${pm.paidAt ? tt.common.paid : pm.transactionStatus}`}
                    value={formatIDR(pm.grossAmount)}
                  />
                ))}
              </div>
            </Panel>
          )}

          <AdminTicketActions tickets={tickets} />
        </div>

        {/* Right: actions */}
        <div className="lg:col-span-2">
          <AdminOrderActions
            orderId={order.id}
            status={order.status}
            agreedTotal={order.agreedTotal}
            dpAmount={order.dpAmount}
            progressPct={order.progressPct}
            progressNote={order.progressNote}
          />
        </div>
      </div>
    </>
  );
}
