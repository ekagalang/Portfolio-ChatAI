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
}: {
  orderId: string;
  type: "dp" | "settlement";
  amount: number;
  label: string;
}) {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type }),
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
      <button
        onClick={handlePay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-mono text-sm font-semibold text-accent-foreground shadow-[0_0_16px_hsl(var(--accent-glow))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        {loading ? t.pay.processing : `${label} ${formatIDR(amount)}`}
      </button>
      {error && <p className="mt-2 font-mono text-xs text-red-400">{error}</p>}
    </div>
  );
}
