import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getOrderById } from "@/lib/orders";
import { formatIDR } from "@/lib/utils";
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

  const total = order.agreedTotal ?? 0;
  const dp = order.dpAmount ?? 0;

  return (
    <>
      <Link href="/admin" className="mb-5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition hover:text-foreground">
        <ChevronLeft className="size-3.5" /> Kelola Order
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">{order.serviceTitle}</h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">#{order.id.slice(-6)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: info */}
        <div className="space-y-4 lg:col-span-3">
          <Panel className="p-5">
            <SectionLabel>Customer</SectionLabel>
            <div className="divide-y divide-border">
              <Row label="Nama" value={order.user.name ?? "—"} />
              <Row label="Email" value={order.user.email} />
              {order.phone && <Row label="No. HP" value={order.phone} />}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionLabel>Brief</SectionLabel>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{order.brief}</p>
          </Panel>

          {order.agreedTotal != null && (
            <Panel className="p-5">
              <SectionLabel>Harga</SectionLabel>
              <div className="divide-y divide-border">
                <Row label="Total" value={formatIDR(total)} />
                <Row label="DP" value={formatIDR(dp)} />
                <Row label="Sisa" value={formatIDR(Math.max(0, total - dp))} />
              </div>
            </Panel>
          )}

          {order.payments.length > 0 && (
            <Panel className="p-5">
              <SectionLabel>Pembayaran</SectionLabel>
              <div className="divide-y divide-border">
                {order.payments.map((pm) => (
                  <Row
                    key={pm.id}
                    label={`${pm.type === "dp" ? "DP" : "Pelunasan"} · ${pm.paidAt ? "lunas" : pm.transactionStatus}`}
                    value={formatIDR(pm.grossAmount)}
                  />
                ))}
              </div>
            </Panel>
          )}
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
