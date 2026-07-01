"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { dateLocale } from "@/lib/i18n";
import { Panel, SectionLabel } from "@/components/dashboard/ui";
import { ticketStatusClass, type TicketRow } from "@/lib/ticket-ui";

const TYPES = ["revision", "complaint", "refund"] as const;

export function TicketSection({ orderId, tickets }: { orderId: string; tickets: TicketRow[] }) {
  const router = useRouter();
  const { lang, t } = useLang();
  const tk = t.ticket;
  const [type, setType] = useState<(typeof TYPES)[number]>("revision");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (message.trim().length < 5) {
      setError(tk.msgPlaceholder);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.actions.failed);
        return;
      }
      setMessage("");
      router.refresh();
    } catch {
      setError(t.common.connError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel className="p-5">
      <SectionLabel>{tk.title}</SectionLabel>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{tk.subtitle}</p>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((tp) => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
                type === tp
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {(tk.types as Record<string, string>)[tp]}
            </button>
          ))}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={tk.msgPlaceholder}
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent/50"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 font-mono text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          {loading ? tk.submitting : tk.submit}
        </button>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>

      {tickets.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {tk.yourRequests}
          </p>
          {tickets.map((tc) => (
            <div key={tc.id} className="rounded-lg border border-border bg-surface/50 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {(tk.types as Record<string, string>)[tc.type] ?? tc.type}
                </span>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${ticketStatusClass(tc.status)}`}>
                  {(tk.statuses as Record<string, string>)[tc.status] ?? tc.status}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {new Date(tc.createdAt).toLocaleDateString(dateLocale(lang))}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{tc.message}</p>
              {tc.response && (
                <div className="mt-2 rounded-md border-l-2 border-accent/40 bg-accent/5 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{tk.adminReply}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/90">{tc.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
