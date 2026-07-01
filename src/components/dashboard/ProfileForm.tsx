"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateLocale } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { Panel, SectionLabel, Row, btnPrimary } from "@/components/dashboard/ui";
import { fieldCls, labelCls } from "@/components/auth/ui";

type Msg = { ok: boolean; text: string } | null;

function FormMsg({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs",
        msg.ok
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-red-400/30 bg-red-400/10 text-red-400"
      )}
    >
      {msg.ok ? <Check className="size-3.5" /> : <AlertCircle className="size-3.5" />}
      {msg.text}
    </p>
  );
}

export function ProfileForm({
  initialName,
  email,
  role,
  hasPassword,
  memberSince,
  orderCount,
}: {
  initialName: string;
  email: string;
  role: string;
  hasPassword: boolean;
  memberSince: string;
  orderCount: number;
}) {
  const router = useRouter();
  const { update } = useSession();
  const { lang, t } = useLang();
  const tp = t.profil;

  const [name, setName] = useState(initialName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<Msg>(null);

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  const initial = (name || email).charAt(0).toUpperCase();
  const isAdmin = role === "admin";

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "name", name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameMsg({ ok: false, text: data.error ?? tp.saveFailed });
        return;
      }
      setNameMsg({ ok: true, text: tp.nameSaved });
      await update({ name }); // segarkan sesi → navbar ikut update
      router.refresh();
    } catch {
      setNameMsg({ ok: false, text: t.common.connError });
    } finally {
      setNameSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: tp.confirmMismatch });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          currentPassword: curPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ ok: false, text: data.error ?? tp.saveFailed });
        return;
      }
      setPwMsg({
        ok: true,
        text: hasPassword ? tp.passwordChanged : tp.passwordSet,
      });
      setCurPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      setPwMsg({ ok: false, text: t.common.connError });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Identity */}
      <div className="space-y-4 lg:col-span-2">
        <Panel className="flex flex-col items-center p-6 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-accent font-mono text-2xl font-bold text-accent-foreground shadow-[0_0_24px_hsl(var(--accent-glow))]">
            {initial}
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{name || "User"}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{email}</p>
          <span
            className={cn(
              "mt-2 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              isAdmin
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-border bg-surface-2 text-muted-foreground"
            )}
          >
            {role}
          </span>
        </Panel>

        <Panel className="p-5">
          <SectionLabel>{tp.account}</SectionLabel>
          <div className="divide-y divide-border">
            <Row label={tp.email} value={email} />
            <Row
              label={tp.memberSince}
              value={new Date(memberSince).toLocaleDateString(dateLocale(lang), {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
            <Row label={tp.totalOrder} value={String(orderCount)} />
            <Row label={tp.loginMethod} value={hasPassword ? tp.emailPassword : tp.google} />
          </div>
        </Panel>
      </div>

      {/* Forms */}
      <div className="space-y-4 lg:col-span-3">
        {/* Nama */}
        <Panel className="p-5">
          <SectionLabel>{tp.changeName}</SectionLabel>
          <form onSubmit={saveName} className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>{tp.fullName}</label>
              <input
                className={fieldCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={nameSaving}
                placeholder={tp.namePlaceholder}
                maxLength={80}
              />
            </div>
            <FormMsg msg={nameMsg} />
            <div>
              <button
                type="submit"
                className={btnPrimary}
                disabled={nameSaving || name.trim() === initialName.trim() || name.trim().length < 2}
              >
                {nameSaving && <Loader2 className="size-3.5 animate-spin" />}
                {t.common.save}
              </button>
            </div>
          </form>
        </Panel>

        {/* Password */}
        <Panel className="p-5">
          <SectionLabel>{hasPassword ? tp.changePassword : tp.setPassword}</SectionLabel>
          {!hasPassword && (
            <p className="mb-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {tp.googleNote}
            </p>
          )}
          <form onSubmit={savePassword} className="flex flex-col gap-3">
            {hasPassword && (
              <div>
                <label className={labelCls}>{tp.currentPassword}</label>
                <input
                  className={fieldCls}
                  type="password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  disabled={pwSaving}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            )}
            <div>
              <label className={labelCls}>
                {tp.newPassword} <span className="normal-case opacity-60">{tp.min8}</span>
              </label>
              <input
                className={fieldCls}
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={pwSaving}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div>
              <label className={labelCls}>{tp.confirmNewPassword}</label>
              <input
                className={fieldCls}
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={pwSaving}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <FormMsg msg={pwMsg} />
            <div>
              <button
                type="submit"
                className={btnPrimary}
                disabled={pwSaving || newPw.length < 8 || confirmPw.length < 8}
              >
                {pwSaving && <Loader2 className="size-3.5 animate-spin" />}
                {hasPassword ? tp.changePassword : tp.setPassword}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
