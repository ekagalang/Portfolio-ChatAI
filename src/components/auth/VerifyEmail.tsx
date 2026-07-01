"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CircleCheck, CircleX } from "lucide-react";
import { AuthShell } from "./ui";

export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    if (!token) {
      setState("fail");
      return;
    }
    let active = true;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => active && setState(r.ok ? "ok" : "fail"))
      .catch(() => active && setState("fail"));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell backHref="/" backLabel="ekagalang.my.id" eyebrow="Verifikasi" title="Verifikasi Email">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Memverifikasi…</p>
          </>
        )}
        {state === "ok" && (
          <>
            <CircleCheck className="size-8 text-accent" />
            <p className="text-sm text-foreground">Email berhasil diverifikasi 🎉</p>
            <Link
              href="/login"
              className="mt-2 font-mono text-xs text-accent transition hover:opacity-80"
            >
              Masuk →
            </Link>
          </>
        )}
        {state === "fail" && (
          <>
            <CircleX className="size-8 text-red-400" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Link verifikasi tidak valid atau sudah kedaluwarsa.
            </p>
            <Link href="/" className="mt-2 font-mono text-xs text-accent transition hover:opacity-80">
              Ke beranda
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
