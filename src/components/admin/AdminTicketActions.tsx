"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { dateLocale } from "@/lib/i18n";
import { Panel, SectionLabel } from "@/components/dashboard/ui";
import { ticketStatusClass, type TicketRow } from "@/lib/ticket-ui";

const STATUSES = ["open", "in_review", "resolved", "rejected"] as const;

function TicketCard({ ticket }: { ticket: TicketRow }) {
  const router = useRouter();
  const { lang, t } = useLang();
  const tk = t.ticket;
  const [status, setStatus] = useState(ticket.status);
  const [response, setResponse] = useState(ticket.response ?? "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, response }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {(tk.types as Record<string, string>)[ticket.type] ?? ticket.type}
        </span>
        <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${ticketStatusClass(ticket.status)}`}>
          {(tk.statuses as Record<string, string>)[ticket.status] ?? ticket.status}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleDateString(dateLocale(lang))}
        </span>
      </div>
      <p className="mb-2.5 whitespace-pre-wrap text-sm text-foreground/90">{ticket.message}</p>

      <div className="space-y-2 border-t border-border pt-2.5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-accent/50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {(tk.statuses as Record<string, string>)[s]}
            </option>
          ))}
        </select>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={2}
          placeholder={tk.respondPlaceholder}
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
        />
        <button
          onClick={save}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-foreground transition hover:border-accent/40 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          {tk.save}
        </button>
      </div>
    </div>
  );
}

export function AdminTicketActions({ tickets }: { tickets: TicketRow[] }) {
  const { t } = useLang();
  if (tickets.length === 0) return null;
  return (
    <Panel className="p-5">
      <SectionLabel>{t.ticket.title}</SectionLabel>
      <div className="space-y-3">
        {tickets.map((tc) => (
          <TicketCard key={tc.id} ticket={tc} />
        ))}
      </div>
    </Panel>
  );
}
