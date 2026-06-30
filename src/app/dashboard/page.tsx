import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getUserOrders } from "@/lib/orders";
import { formatIDR } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PageHeader, StatCard, Panel, EmptyState, btnPrimary } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", robots: { index: false } };

const ACTIVE = ["quoted", "dp_paid", "in_progress", "awaiting_settlement"];

export default async function DashboardPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  const active = orders.filter((o) => ACTIVE.includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const totalPaid = orders
    .flatMap((o) => o.payments)
    .filter((p) => p.paidAt)
    .reduce((s, p) => s + p.grossAmount, 0);

  return (
    <>
      <PageHeader
        title={`Halo, ${(user.name ?? user.email ?? "").split(" ")[0]} 👋`}
        subtitle="Pantau pesanan, status pengerjaan, dan pembayaranmu di sini."
        action={
          <Link href="/services" className={btnPrimary}>
            + Pesan jasa baru
          </Link>
        }
      />

      {/* Stats */}
      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Order" value={String(orders.length)} />
        <StatCard label="Sedang Aktif" value={String(active)} />
        <StatCard label="Selesai" value={String(completed)} />
        <StatCard label="Total Dibayar" value={formatIDR(totalPaid)} />
      </div>

      {/* Orders */}
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Pesanan
      </p>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          desc="Mulai dengan memilih jasa yang kamu butuhkan. Saya akan kirim penawaran harga setelah diskusi."
          action={
            <Link href="/services" className={btnPrimary}>
              Lihat jasa
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="block">
              <Panel className="group p-4 transition hover:border-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{o.serviceTitle}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}#{o.id.slice(-6)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {o.agreedTotal != null ? (
                    <p className="font-mono text-xs text-muted-foreground">
                      Total <span className="text-foreground">{formatIDR(o.agreedTotal)}</span>
                      {" · DP "}
                      <span className="text-foreground">{formatIDR(o.dpAmount ?? 0)}</span>
                    </p>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground">Menunggu penawaran</p>
                  )}
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
