"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";
import type { MidtransSnapResult } from "@/types/payment";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (r: MidtransSnapResult) => void;
          onPending?: (r: MidtransSnapResult) => void;
          onError?: (r: MidtransSnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function PayButton({
  orderId,
  type,
  amount,
  label,
  allowPartial = false,
}: {
  orderId: string;
  type: "dp" | "settlement";
  amount: number;
  label: string;
  allowPartial?: boolean;
}) {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);
  const [custom, setCustom] = useState("");

  // Nominal efektif yang akan dibayar (mendukung cicilan pelunasan).
  const customNum = Math.round(Number(custom));
  const usePartial = allowPartial && partial;
  const effAmount = usePartial ? customNum : amount;
  const partialInvalid = usePartial && (!Number.isFinite(customNum) || customNum <= 0 || customNum > amount);

  const handlePay = async () => {
    if (partialInvalid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type, ...(usePartial ? { amount: effAmount } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.pay.failed);
        setLoading(false);
        return;
      }

      const done = () => {
        setLoading(false);
        router.refresh();
      };

      if (typeof window.snap?.pay === "function") {
        window.snap.pay(data.token, {
          onSuccess: done,
          onPending: done,
          onError: () => {
            setError(t.pay.failed);
            setLoading(false);
          },
          onClose: () => setLoading(false),
        });
      } else {
        window.open(data.redirectUrl, "_blank");
        setLoading(false);
      }
    } catch {
      setError(t.common.connError);
      setLoading(false);
    }
  };

  return (
    <div>
      {allowPartial && (
        <div className="mb-2.5">
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={partial}
              onChange={(e) => setPartial(e.target.checked)}
              className="size-3.5 accent-[hsl(var(--accent))]"
            />
            {t.pay.installment}
          </label>
          {partial && (
            <div className="mt-2">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={amount}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={t.pay.amountUpTo.replace("{max}", formatIDR(amount))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-accent/50"
              />
              {partialInvalid && custom !== "" && (
                <p className="mt-1 font-mono text-[11px] text-red-400">{t.pay.amountInvalid}</p>
              )}
            </div>
          )}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading || partialInvalid}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-mono text-sm font-semibold text-accent-foreground shadow-[0_0_16px_hsl(var(--accent-glow))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        {loading ? t.pay.processing : `${label} ${formatIDR(usePartial && !partialInvalid ? effAmount : amount)}`}
      </button>
      {error && <p className="mt-2 font-mono text-xs text-red-400">{error}</p>}
    </div>
  );
}
