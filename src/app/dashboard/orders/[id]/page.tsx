import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle, FileText } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrderForUser } from "@/lib/orders";
import { formatIDR, cn, orderLabel } from "@/lib/utils";
import { ORDER_LIFECYCLE, ORDER_STATUS_LABEL } from "@/lib/payment-config";
import { getLang } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PayButton } from "@/components/dashboard/PayButton";
import { Panel, SectionLabel, Row } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Order", robots: { index: false } };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  const lang = await getLang();
  const tt = t(lang);
  const total = order.agreedTotal ?? 0;
  const dp = order.dpAmount ?? 0;
  const remaining = Math.max(0, total - dp);
  const currentIdx = ORDER_LIFECYCLE.indexOf(order.status as (typeof ORDER_LIFECYCLE)[number]);
  const isCancelled = order.status === "cancelled";

  return (
    <>
      <Link href="/dashboard" className="mb-5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition hover:text-foreground">
        <ChevronLeft className="size-3.5" /> {tt.nav.dashboard}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">{order.serviceTitle}</h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{orderLabel(order)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: timeline + brief */}
        <div className="space-y-4 lg:col-span-3">
          {!isCancelled && (
            <Panel className="p-5">
              <SectionLabel>{tt.order.progress}</SectionLabel>
              <ol className="relative">
                {ORDER_LIFECYCLE.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const last = i === ORDER_LIFECYCLE.length - 1;
                  return (
                    <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                      {!last && (
                        <span
                          className={cn(
                            "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                            done ? "bg-accent/40" : "bg-border"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "z-10 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] transition",
                          done ? "bg-accent text-accent-foreground" : "border border-border bg-surface text-muted-foreground",
                          active && "ring-2 ring-accent/40"
                        )}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={cn("pt-0.5 text-sm", done ? "text-foreground" : "text-muted-foreground")}>
                        {ORDER_STATUS_LABEL[step]?.[lang] ?? step}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {order.status === "in_progress" && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="mb-1.5 flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>{tt.order.working}</span>
                    <span className="tabular-nums text-foreground">{order.progressPct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${order.progressPct}%` }} />
                  </div>
                  {order.progressNote && (
                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{order.progressNote}</p>
                  )}
                </div>
              )}
            </Panel>
          )}

          <Panel className="p-5">
            <SectionLabel>{tt.order.brief}</SectionLabel>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{order.brief}</p>
          </Panel>
        </div>

        {/* Right: pricing + actions */}
        <div className="space-y-4 lg:col-span-2">
          <Panel className="p-5">
            <SectionLabel>{tt.order.payment}</SectionLabel>
            {order.agreedTotal == null ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {tt.order.awaitingQuoteLong}
              </p>
            ) : (
              <div className="divide-y divide-border">
                <Row label={tt.order.agreedTotal} value={formatIDR(total)} />
                <Row label={tt.order.dp} value={<span>{formatIDR(dp)}{order.status !== "quoted" && <span className="ml-1 text-accent">✓</span>}</span>} />
                <Row label={tt.order.remaining} value={formatIDR(remaining)} />
              </div>
            )}

            {order.status === "quoted" && (
              <div className="mt-4">
                <PayButton orderId={order.id} type="dp" amount={dp} label={tt.order.payDp} />
              </div>
            )}
            {order.status === "awaiting_settlement" && (
              <div className="mt-4">
                <PayButton orderId={order.id} type="settlement" amount={remaining} label={tt.order.paySettlement} />
              </div>
            )}
          </Panel>

          {order.payments.length > 0 && (
            <Panel className="p-5">
              <SectionLabel>{tt.order.history}</SectionLabel>
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

          {order.agreedTotal != null && (
            <a
              href={`/api/orders/${order.id}/invoice`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 font-mono text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
            >
              <FileText className="size-4" /> {tt.invoice.download}
            </a>
          )}

          <a
            href="https://wa.me/6285157222301"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 font-mono text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
          >
            <MessageCircle className="size-4" /> {tt.order.askAbout}
          </a>
        </div>
      </div>
    </>
  );
}
