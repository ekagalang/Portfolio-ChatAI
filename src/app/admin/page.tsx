import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { listOrders } from "@/lib/orders";
import { formatIDR, cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/payment-config";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

const FILTERS = ["all", "requested", "quoted", "dp_paid", "in_progress", "awaiting_settlement", "completed"];
const ACTIVE = ["quoted", "dp_paid", "in_progress", "awaiting_settlement"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = status && status !== "all" ? status : undefined;

  const all = await listOrders();
  const orders = filter ? all.filter((o) => o.status === filter) : all;

  const needsAction = all.filter((o) => o.status === "requested").length;
  const active = all.filter((o) => ACTIVE.includes(o.status)).length;
  const revenue = all
    .flatMap((o) => o.payments)
    .filter((p) => p.paidAt)
    .reduce((s, p) => s + p.grossAmount, 0);

  return (
    <>
      <PageHeader title="Kelola Order" subtitle="Tinjau permintaan, tetapkan harga, dan pantau pembayaran." />

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Order" value={String(all.length)} />
        <StatCard label="Perlu Ditindak" value={String(needsAction)} hint="menunggu penawaran" />
        <StatCard label="Sedang Aktif" value={String(active)} />
        <StatCard label="Pendapatan" value={formatIDR(revenue)} />
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const isActive = (filter ?? "all") === f;
          return (
            <Link
              key={f}
              href={f === "all" ? "/admin" : `/admin?status=${f}`}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs transition",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "Semua" : ORDER_STATUS_LABEL[f]?.id ?? f}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Tidak ada order" desc="Belum ada order pada filter ini." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block">
              <Panel className="group p-4 transition hover:border-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{o.serviceTitle}</p>
                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      {o.user.name ?? o.user.email}
                      {" · "}
                      {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-mono text-xs text-muted-foreground">
                    {o.agreedTotal != null ? (
                      <>
                        Total <span className="text-foreground">{formatIDR(o.agreedTotal)}</span>
                        {" · DP "}
                        <span className="text-foreground">{formatIDR(o.dpAmount ?? 0)}</span>
                      </>
                    ) : (
                      "Belum ada harga"
                    )}
                  </p>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
