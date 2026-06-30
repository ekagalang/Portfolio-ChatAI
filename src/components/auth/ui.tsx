import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Field primitives (theme-aware, match site tokens) ── */

export const labelCls =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground";

export const fieldCls =
  "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

/* ── Shell: themed full-screen layout with brand + card ── */

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  className,
  backHref = "/",
  backLabel = "ekagalang.my.id",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-14">
      {/* Decorative accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[130px]"
      />

      {/* Back link */}
      <Link
        href={backHref}
        className="absolute left-5 top-5 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" /> {backLabel}
      </Link>

      <div className={cn("w-full max-w-sm animate-fade-up", className)}>
        {/* Card — brand + title + form as one cohesive unit */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.06),0_18px_40px_-12px_rgba(15,23,42,0.30)]">
          {/* Header */}
          <div className="flex flex-col items-center border-b border-border bg-surface-2/40 px-6 pb-6 pt-7 text-center sm:px-8">
            <span className="grid size-11 place-items-center rounded-xl bg-accent font-mono text-lg font-bold text-accent-foreground shadow-[0_0_24px_hsl(var(--accent-glow))]">
              G
            </span>
            {eyebrow && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1.5 font-mono text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">{children}</div>
        </div>

        {footer && <div className="mt-5 text-center text-xs text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}

/* ── Form bits ── */

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 font-mono text-xs text-red-400">
      {children}
    </p>
  );
}

export function SubmitButton({
  loading,
  children,
}: {
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_16px_hsl(var(--accent-glow))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GoogleButton({
  onClick,
  label = "Lanjut dengan Google",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/40 hover:bg-surface"
    >
      <GoogleIcon /> {label}
    </button>
  );
}

export function Divider({ children = "atau" }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
