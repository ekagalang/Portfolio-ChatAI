"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";

const fieldCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-accent/50";
const labelCls = "mb-1.5 block font-mono text-[11px] text-muted-foreground";
const cardCls = "rounded-xl border border-border bg-surface p-5";
const headCls = "mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";

export function AdminOrderActions({
  orderId,
  status,
  agreedTotal,
  dpAmount,
  progressPct,
  progressNote,
}: {
  orderId: string;
  status: string;
  agreedTotal: number | null;
  dpAmount: number | null;
  progressPct: number;
  progressNote: string | null;
}) {
  const router = useRouter();
  const { t } = useLang();
  const ta = t.actions;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [total, setTotal] = useState(agreedTotal?.toString() ?? "");
  const [dp, setDp] = useState(dpAmount?.toString() ?? "");
  const [pct, setPct] = useState(progressPct.toString());
  const [note, setNote] = useState(progressNote ?? "");

  const call = async (payload: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? ta.failed);
      return;
    }
    router.refresh();
  };

  const primary =
    "flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50";

  return (
    <div className="space-y-4">
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Tetapkan harga */}
      {status === "requested" && (
        <div className={cardCls}>
          <p className={headCls}>{ta.setPrice}</p>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{ta.agreedTotal}</label>
              <input className={fieldCls} type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="5000000" />
            </div>
            <div>
              <label className={labelCls}>{ta.dp}</label>
              <input className={fieldCls} type="number" value={dp} onChange={(e) => setDp(e.target.value)} placeholder="1500000" />
            </div>
          </div>
          <button className={primary} disabled={busy} onClick={() => call({ action: "quote", agreedTotal: Number(total), dpAmount: Number(dp) })}>
            {ta.sendQuote}
          </button>
        </div>
      )}

      {/* Mulai pengerjaan */}
      {status === "dp_paid" && (
        <div className={cardCls}>
          <p className={headCls}>{ta.work}</p>
          <button className={primary} disabled={busy} onClick={() => call({ action: "status", status: "in_progress" })}>
            {ta.startWork}
          </button>
        </div>
      )}

      {/* Progress + pelunasan */}
      {status === "in_progress" && (
        <div className={cardCls}>
          <p className={headCls}>{ta.progress}</p>
          <label className={labelCls}>{ta.percentage(Number(pct) || 0)}</label>
          <input className={cn(fieldCls, "mb-3")} type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} />
          <label className={labelCls}>{ta.progressNote}</label>
          <textarea
            className={cn(fieldCls, "mb-3 min-h-[72px] resize-y leading-relaxed")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={ta.progressNotePh}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs font-semibold text-foreground transition hover:border-accent/40 disabled:opacity-50"
              disabled={busy}
              onClick={() => call({ action: "progress", progressPct: Number(pct), progressNote: note })}
            >
              {ta.save}
            </button>
            <button className={cn(primary, "flex-1")} disabled={busy} onClick={() => call({ action: "issue_settlement" })}>
              {ta.issueSettlement}
            </button>
          </div>
        </div>
      )}

      {/* Batalkan */}
      {!["completed", "cancelled"].includes(status) && (
        <div className={cardCls}>
          <button
            className="w-full rounded-lg border border-red-400/40 bg-transparent px-4 py-2.5 font-mono text-xs font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
            disabled={busy}
            onClick={() => call({ action: "status", status: "cancelled" })}
          >
            {ta.cancelOrder}
          </button>
        </div>
      )}

      {status === "completed" && (
        <div className={cn(cardCls, "text-center")}>
          <p className="font-mono text-sm text-accent">{ta.orderDone}</p>
        </div>
      )}
    </div>
  );
}
