import { formatIDR } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/payment-config";
import { dateLocale, t, type Lang } from "@/lib/i18n";
import { StatCard, Panel, SectionLabel } from "@/components/dashboard/ui";
import type { Analytics } from "@/lib/analytics";

/** Ringkas nominal untuk label bar (mis. 1.5jt / 1.5M). */
function compact(n: number, lang: Lang): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}${lang === "en" ? "M" : "jt"}`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}${lang === "en" ? "k" : "rb"}`;
  return String(n);
}

export function AnalyticsView({ data, lang }: { data: Analytics; lang: Lang }) {
  const ta = t(lang).analytics;
  const maxRev = Math.max(...data.months.map((m) => m.revenue), 1);
  const maxStatus = Math.max(...data.byStatus.map((s) => s.count), 1);
  const maxSvc = Math.max(...data.topServices.map((s) => s.count), 1);

  return (
    <>
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={ta.revenue} value={formatIDR(data.revenue)} hint={ta.revenueHint} />
        <StatCard label={ta.outstanding} value={formatIDR(data.outstanding)} hint={ta.outstandingHint} />
        <StatCard
          label={ta.totalOrders}
          value={String(data.totalOrders)}
          hint={`${data.completed} ${ta.completed} · ${data.conversionPct}% ${ta.conversion}`}
        />
        <StatCard
          label={ta.users}
          value={String(data.totalUsers)}
          hint={`+${data.newUsersThisMonth} ${ta.thisMonth}`}
        />
      </div>

      {/* Revenue by month */}
      <Panel className="mb-4 p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <SectionLabel>{ta.revenueByMonth}</SectionLabel>
          <p className="font-mono text-[11px] text-muted-foreground">
            {ta.avgOrder}: <span className="text-foreground">{formatIDR(data.avgOrderValue)}</span>
          </p>
        </div>

        <div className="flex h-40 items-end gap-2 border-b border-border">
          {data.months.map((m) => {
            const pct = m.revenue > 0 ? Math.max(4, Math.round((m.revenue / maxRev) * 100)) : 0;
            return (
              <div
                key={`${m.year}-${m.month}`}
                className="relative flex-1 rounded-t bg-accent/80 transition hover:bg-accent"
                style={{ height: `${pct}%` }}
                title={formatIDR(m.revenue)}
              >
                {m.revenue > 0 && (
                  <span className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-muted-foreground">
                    {compact(m.revenue, lang)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          {data.months.map((m) => (
            <span
              key={`${m.year}-${m.month}-l`}
              className="flex-1 text-center font-mono text-[10px] capitalize text-muted-foreground"
            >
              {new Date(m.year, m.month, 1).toLocaleDateString(dateLocale(lang), { month: "short" })}
            </span>
          ))}
        </div>
      </Panel>

      {/* Status + services */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <SectionLabel>{ta.ordersByStatus}</SectionLabel>
          {data.byStatus.length === 0 ? (
            <p className="text-xs text-muted-foreground">{ta.noData}</p>
          ) : (
            <div className="space-y-2.5">
              {data.byStatus.map((s) => (
                <div key={s.status}>
                  <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">
                      {ORDER_STATUS_LABEL[s.status]?.[lang] ?? s.status}
                    </span>
                    <span className="tabular-nums text-foreground">{s.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round((s.count / maxStatus) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="p-5">
          <SectionLabel>{ta.topServices}</SectionLabel>
          {data.topServices.length === 0 ? (
            <p className="text-xs text-muted-foreground">{ta.noData}</p>
          ) : (
            <div className="space-y-2.5">
              {data.topServices.map((s) => (
                <div key={s.title}>
                  <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="truncate text-foreground">{s.title}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {s.count} · {formatIDR(s.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round((s.count / maxSvc) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
