"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { dateLocale } from "@/lib/i18n";

export interface AuditRow {
  id: string;
  action: string;
  actorEmail: string;
  targetId: string | null;
  targetEmail: string | null;
  detail: string | null;
  createdAt: string; // ISO
}

const PAGE = 25;

export function AuditList({ rows }: { rows: AuditRow[] }) {
  const { lang, t } = useLang();
  const ta = t.audit;
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const actionLabel = (a: string) =>
    (ta.actions as Record<string, string>)[a] ?? a;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        actionLabel(r.action).toLowerCase().includes(s) ||
        r.action.toLowerCase().includes(s) ||
        r.actorEmail.toLowerCase().includes(s) ||
        (r.targetEmail ?? "").toLowerCase().includes(s) ||
        (r.detail ?? "").toLowerCase().includes(s)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, rows]);

  const shown = filtered.slice(0, visible);
  const fmt = (iso: string) => new Date(iso).toLocaleString(dateLocale(lang));

  const exportCsv = () => {
    const head = ["waktu", "admin", "aksi", "target_email", "target_id", "detail"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [
        new Date(r.createdAt).toISOString(),
        r.actorEmail,
        r.action,
        r.targetEmail ?? "",
        r.targetId ?? "",
        r.detail ?? "",
      ]
        .map((v) => esc(String(v)))
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setVisible(PAGE);
            }}
            placeholder={ta.filter}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 font-mono text-xs text-foreground outline-none transition focus:border-accent/50"
          />
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Download className="size-3.5" /> {ta.exportCsv}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/50 p-8 text-center font-mono text-xs text-muted-foreground">
          {ta.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">{ta.colDate}</th>
                <th className="px-3 py-2.5 font-medium">{ta.colActor}</th>
                <th className="px-3 py-2.5 font-medium">{ta.colAction}</th>
                <th className="px-3 py-2.5 font-medium">{ta.colTarget}</th>
                <th className="px-3 py-2.5 font-medium">{ta.colDetail}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((r) => (
                <tr key={r.id} className="align-top transition hover:bg-surface-2/30">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {fmt(r.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 text-foreground/90">{r.actorEmail}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                      {actionLabel(r.action)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.targetEmail ?? "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          {shown.length} / {filtered.length}
        </span>
        {visible < filtered.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground transition hover:border-accent/40"
          >
            {ta.loadMore}
          </button>
        )}
      </div>
    </div>
  );
}
