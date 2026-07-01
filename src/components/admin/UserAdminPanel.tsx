"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Ban, CircleCheck, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";
import { Panel, SectionLabel } from "@/components/dashboard/ui";
import { fieldCls } from "@/components/auth/ui";

const actBtn =
  "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-xs font-semibold transition disabled:opacity-50";

export function UserAdminPanel({
  userId,
  name,
  email,
  suspended,
  hasPassword,
  initialNotes,
  canAct,
}: {
  userId: string;
  name: string | null;
  email: string;
  suspended: boolean;
  hasPassword: boolean;
  initialNotes: string;
  canAct: boolean;
}) {
  const router = useRouter();
  const { t } = useLang();
  const tu = t.users;
  const displayName = name ?? email;

  const [notes, setNotes] = useState(initialNotes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState<string | null>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [temp, setTemp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const call = async (method: "PATCH" | "POST", body: object, key: string) => {
    setBusy(key);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.actions.failed);
        return null;
      }
      return data as { tempPassword?: string };
    } catch {
      setError(t.common.connError);
      return null;
    } finally {
      setBusy(null);
    }
  };

  const saveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    setNotesMsg(null);
    const ok = await call("PATCH", { action: "notes", notes }, "notes");
    setSavingNotes(false);
    if (ok) {
      setNotesMsg(tu.notesSaved);
      router.refresh();
    }
  };

  const toggleFreeze = async () => {
    const msg = suspended ? tu.unfreezeConfirm(displayName) : tu.freezeConfirm(displayName);
    if (!window.confirm(msg)) return;
    const ok = await call("PATCH", { action: suspended ? "unsuspend" : "suspend" }, "freeze");
    if (ok) router.refresh();
  };

  const resetTemp = async () => {
    if (!window.confirm(tu.resetConfirm(displayName))) return;
    const data = await call("POST", { mode: "temp" }, "temp");
    if (data?.tempPassword) {
      setTemp(data.tempPassword);
      setCopied(false);
    }
  };

  const resetEmail = async () => {
    if (!window.confirm(tu.resetConfirm(displayName))) return;
    const ok = await call("POST", { mode: "email" }, "email");
    if (ok) setInfo(tu.resetEmailSent);
  };

  const copyTemp = async () => {
    if (!temp) return;
    try {
      await navigator.clipboard.writeText(temp);
      setCopied(true);
    } catch {
      /* manual copy */
    }
  };

  if (!canAct) return null;

  return (
    <div className="space-y-4">
      {/* Notes */}
      <Panel className="p-5">
        <SectionLabel>{tu.notes}</SectionLabel>
        <form onSubmit={saveNotes} className="flex flex-col gap-2">
          <textarea
            className={cn(fieldCls, "min-h-24 resize-y leading-relaxed")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tu.notesPlaceholder}
            maxLength={2000}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingNotes}
              className={cn(actBtn, "w-auto border-border bg-surface-2 text-foreground hover:border-accent/40")}
            >
              {savingNotes && <Loader2 className="size-3.5 animate-spin" />}
              {t.common.save}
            </button>
            {notesMsg && <span className="font-mono text-[11px] text-accent">{notesMsg}</span>}
          </div>
        </form>
      </Panel>

      {/* Actions */}
      <Panel className="space-y-2.5 p-5">
        <SectionLabel>{tu.status}</SectionLabel>

        {temp && (
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
            <p className="font-mono text-[11px] text-muted-foreground">{tu.tempPasswordFor(email)}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="select-all font-mono text-sm font-semibold text-foreground">{temp}</p>
              <button
                onClick={copyTemp}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:text-accent"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? tu.copied : tu.copy}
              </button>
            </div>
          </div>
        )}

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        {info && <p className="font-mono text-xs text-accent">{info}</p>}

        <button
          onClick={toggleFreeze}
          disabled={busy === "freeze"}
          className={cn(
            actBtn,
            suspended
              ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
              : "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
          )}
        >
          {busy === "freeze" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : suspended ? (
            <CircleCheck className="size-3.5" />
          ) : (
            <Ban className="size-3.5" />
          )}
          {suspended ? tu.unfreeze : tu.freeze}
        </button>

        {hasPassword && (
          <>
            <button
              onClick={resetTemp}
              disabled={busy === "temp"}
              className={cn(actBtn, "border-border bg-surface-2 text-foreground hover:border-accent/40")}
            >
              {busy === "temp" ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
              {tu.resetTemp}
            </button>
            <button
              onClick={resetEmail}
              disabled={busy === "email"}
              className={cn(actBtn, "border-border bg-surface-2 text-foreground hover:border-accent/40")}
            >
              {busy === "email" ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
              {tu.resetEmail}
            </button>
          </>
        )}
      </Panel>
    </div>
  );
}
