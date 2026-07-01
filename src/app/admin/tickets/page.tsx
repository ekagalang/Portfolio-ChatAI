import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { listTickets } from "@/lib/tickets";
import { getLang } from "@/lib/i18n.server";
import { t, dateLocale } from "@/lib/i18n";
import { PageHeader } from "@/components/dashboard/ui";
import { orderLabel } from "@/lib/utils";
import { ticketStatusClass } from "@/lib/ticket-ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Tiket", robots: { index: false } };

const FILTERS = ["all", "open", "in_review", "resolved", "rejected"] as const;

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const lang = await getLang();
  const tk = t(lang).ticket;
  const { status } = await searchParams;
  const active = status && FILTERS.includes(status as (typeof FILTERS)[number]) ? status : "all";
  const tickets = await listTickets(active !== "all" ? active : undefined);

  return (
    <>
      <PageHeader title={tk.manageTitle} subtitle={tk.manageSubtitle} />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/tickets" : `/admin/tickets?status=${f}`}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
              active === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? tk.filterAll : (tk.statuses as Record<string, string>)[f]}
          </Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/50 p-8 text-center font-mono text-xs text-muted-foreground">
          {tk.empty}
        </p>
      ) : (
        <div className="space-y-2">
          {tickets.map((tc) => (
            <Link
              key={tc.id}
              href={`/admin/orders/${tc.order.id}`}
              className="block rounded-xl border border-border bg-surface/50 p-4 transition hover:border-accent/40"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {(tk.types as Record<string, string>)[tc.type] ?? tc.type}
                </span>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${ticketStatusClass(tc.status)}`}>
                  {(tk.statuses as Record<string, string>)[tc.status] ?? tc.status}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {orderLabel(tc.order)} · {tc.order.user.email}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-foreground/90">{tc.message}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {new Date(tc.createdAt).toLocaleString(dateLocale(lang))} · {tc.order.serviceTitle}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
