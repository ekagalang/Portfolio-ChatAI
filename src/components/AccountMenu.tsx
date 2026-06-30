"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LayoutDashboard, ShieldCheck, LogOut, ChevronDown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountMenu({ language }: { language: "id" | "en" }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Inside the dashboard/admin shell the sidebar already handles navigation,
  // so the dropdown is trimmed to just the profile + logout.
  const inDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Loading skeleton (avoid layout shift)
  if (status === "loading") {
    return <div className="h-8 w-[68px] animate-pulse rounded-full bg-surface-2" />;
  }

  // Not signed in → login button
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 font-mono text-xs font-medium text-accent transition hover:bg-accent/20"
      >
        <LogIn className="size-3.5" />
        {language === "id" ? "Masuk" : "Login"}
      </Link>
    );
  }

  const user = session.user;
  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();
  const isAdmin = user.role === "admin";

  const itemCls =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-mono text-xs text-muted-foreground transition hover:bg-surface-2 hover:text-foreground";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface py-0.5 pl-1 pr-2 transition hover:border-accent/40"
      >
        <span className="grid size-6 place-items-center rounded-full bg-accent font-mono text-[11px] font-bold text-accent-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate font-mono text-xs text-foreground sm:block">
          {user.name ?? user.email}
        </span>
        <ChevronDown
          className={cn("size-3 shrink-0 text-muted-foreground transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 animate-fade-in overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_32px_-8px_rgba(15,23,42,0.30)]">
          {/* Account info */}
          <div className="border-b border-border bg-surface-2/40 px-3.5 py-3">
            <p className="truncate text-sm font-medium text-foreground">{user.name ?? "User"}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <span className="mt-1.5 inline-block rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                admin
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <Link href="/dashboard/profil" onClick={() => setOpen(false)} className={itemCls}>
              <UserRound className="size-4 shrink-0" />
              Profil
            </Link>
            {!inDashboard && (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className={itemCls}>
                  <LayoutDashboard className="size-4 shrink-0" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className={itemCls}>
                    <ShieldCheck className="size-4 shrink-0" />
                    Kelola Order
                  </Link>
                )}
              </>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(itemCls, "hover:bg-red-400/10 hover:text-red-400")}
            >
              <LogOut className="size-4 shrink-0" />
              {language === "id" ? "Keluar" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
