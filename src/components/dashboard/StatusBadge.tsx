"use client";

import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/payment-config";
import { useLang } from "@/components/LangProvider";

const STYLES: Record<string, string> = {
  requested: "bg-muted text-muted-foreground",
  quoted: "bg-accent/10 text-accent",
  dp_paid: "bg-accent/10 text-accent",
  in_progress: "bg-amber-400/10 text-amber-400",
  awaiting_settlement: "bg-amber-400/10 text-amber-400",
  completed: "bg-accent/15 text-accent",
  cancelled: "bg-red-400/10 text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  const { lang } = useLang();
  const cls = STYLES[status] ?? STYLES.requested;
  const labelText = ORDER_STATUS_LABEL[status]?.[lang] ?? status;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
        cls
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {labelText}
    </span>
  );
}
