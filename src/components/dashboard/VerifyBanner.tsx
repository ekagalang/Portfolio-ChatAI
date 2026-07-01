"use client";

import { useState } from "react";
import { MailWarning, X, Loader2, Check } from "lucide-react";
import { useLang } from "@/components/LangProvider";

export function VerifyBanner() {
  const { t } = useLang();
  const tv = t.verify;

  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  const resend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? t.actions.failed);
        return;
      }
      setSent(true);
    } catch {
      setError(t.common.connError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
      <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{tv.bannerTitle}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tv.bannerDesc}</p>
        <div className="mt-2 flex items-center gap-3">
          {sent ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent">
              <Check className="size-3.5" /> {tv.sent}
            </span>
          ) : (
            <button
              onClick={resend}
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 font-mono text-xs text-amber-400 transition hover:bg-amber-400/20 disabled:opacity-50"
            >
              {sending && <Loader2 className="size-3.5 animate-spin" />}
              {tv.resend}
            </button>
          )}
          {error && <span className="font-mono text-xs text-red-400">{error}</span>}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label={tv.dismiss}
        className="shrink-0 text-muted-foreground transition hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
