"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateLocale } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { Panel, EmptyState } from "@/components/dashboard/ui";
import { fieldCls } from "@/components/auth/ui";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  suspended: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  hasPassword: boolean;
  isSelf: boolean;
}

type Sort = "newest" | "oldest" | "orders" | "name";
const PAGE = 20;

export function UserList({ users }: { users: UserRow[] }) {
  const { lang, t } = useLang();
  const tu = t.users;

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(PAGE);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(dateLocale(lang), { day: "numeric", month: "short", year: "numeric" });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = term
      ? users.filter(
          (u) => (u.name ?? "").toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
      : users.slice();
    list = list.sort((a, b) => {
      if (sort === "orders") return b.orderCount - a.orderCount;
      if (sort === "name") return (a.name ?? a.email).localeCompare(b.name ?? b.email);
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "oldest" ? da - db : db - da;
    });
    return list;
  }, [users, q, sort]);

  const shown = filtered.slice(0, visible);

  const exportCsv = () => {
    const head = ["name", "email", "role", "status", "orders", "joined", "last_login", "login"];
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = filtered.map((u) =>
      [
        u.name ?? "",
        u.email,
        u.isAdmin ? "admin" : "customer",
        u.suspended ? "frozen" : "active",
        String(u.orderCount),
        new Date(u.createdAt).toISOString().slice(0, 10),
        u.lastLoginAt ? new Date(u.lastLoginAt).toISOString().slice(0, 10) : "",
        u.hasPassword ? "password" : "google",
      ]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={cn(fieldCls, "pl-9")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setVisible(PAGE);
            }}
            placeholder={tu.search}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className={cn(fieldCls, "cursor-pointer sm:w-44")}
          aria-label={tu.sortLabel}
        >
          <option value="newest">{tu.sortNewest}</option>
          <option value="oldest">{tu.sortOldest}</option>
          <option value="orders">{tu.sortOrders}</option>
          <option value="name">{tu.sortName}</option>
        </select>
        <button
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
        >
          <Download className="size-3.5" />
          {tu.exportCsv}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={q ? tu.emptySearch : tu.empty} desc="" />
      ) : (
        <>
          {shown.map((u) => {
            const initial = (u.name ?? u.email).charAt(0).toUpperCase();
            return (
              <Link key={u.id} href={`/admin/users/${u.id}`} className="block">
                <Panel
                  className={cn(
                    "group flex items-center gap-3 p-3.5 transition hover:border-accent/40",
                    u.suspended && "opacity-60"
                  )}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs font-bold text-accent">
                    {initial}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">{u.name ?? "—"}</p>
                      {u.isAdmin && (
                        <span className="shrink-0 rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                          admin
                        </span>
                      )}
                      {u.isSelf && (
                        <span className="shrink-0 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {tu.you}
                        </span>
                      )}
                      {u.suspended && (
                        <span className="shrink-0 rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400">
                          {tu.frozen}
                        </span>
                      )}
                    </div>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{u.email}</p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {tu.orders}: <span className="text-foreground">{u.orderCount}</span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {tu.lastLogin}: {u.lastLoginAt ? fmtDate(u.lastLoginAt) : tu.never}
                    </p>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </Panel>
              </Link>
            );
          })}

          <div className="flex items-center justify-between pt-1">
            <p className="font-mono text-[11px] text-muted-foreground">
              {tu.showing(shown.length, filtered.length)}
            </p>
            {visible < filtered.length && (
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
              >
                {tu.loadMore}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
