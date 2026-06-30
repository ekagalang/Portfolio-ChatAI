"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, PlusCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const USER_NAV: NavItem[] = [
  { href: "/", label: "Halaman Utama", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pesan", label: "Pesan Jasa", icon: PlusCircle },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/", label: "Halaman Utama", icon: Home },
  { href: "/admin", label: "Kelola Order", icon: ShieldCheck },
];

export function DashboardShell({
  variant = "user",
  children,
}: {
  variant?: "user" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminArea = variant === "admin";
  const nav = isAdminArea ? ADMIN_NAV : USER_NAV;

  const isActive = (href: string) => {
    if (href === "/") return false; // exit link, never highlighted
    if (href === "/dashboard")
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/orders");
    if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/");
    return pathname.startsWith(href);
  };

  const sidebarItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm transition",
          active
            ? "bg-accent/10 text-accent"
            : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {item.label}
        {active && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
      </Link>
    );
  };

  const pill = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs transition",
          active
            ? "bg-accent text-accent-foreground"
            : "border border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="size-3.5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar — same as home page, kept sticky */}
      <div className="sticky top-0 z-40">
        <Navbar language="id" />
      </div>

      {/* Desktop sidebar (offset below the 53px navbar) */}
      <aside className="fixed bottom-0 left-0 top-[53px] hidden w-60 flex-col border-r border-border bg-surface/50 backdrop-blur md:flex">
        {/* Area label */}
        <div className="flex items-center gap-2 px-4 pb-1 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {isAdminArea ? "Panel Admin" : "Dashboard"}
          </p>
          {isAdminArea && (
            <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
              admin
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">{nav.map(sidebarItem)}</nav>
      </aside>

      {/* Mobile nav — horizontal scrollable pills below navbar */}
      <div className="sticky top-[53px] z-30 flex items-center gap-1.5 overflow-x-auto border-b border-border bg-surface/80 px-4 py-2 backdrop-blur md:hidden">
        {nav.map(pill)}
      </div>

      {/* Content */}
      <main className="md:ml-60">
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
