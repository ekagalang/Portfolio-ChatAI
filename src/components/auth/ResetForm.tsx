"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell, FormError, SubmitButton, fieldCls, labelCls } from "./ui";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan.");
        return;
      }
      setDone(true);
    } catch {
      setError("Koneksi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      backHref="/login"
      backLabel="Masuk"
      eyebrow="Reset Password"
      title="Password Baru"
      subtitle="Buat password baru untuk akunmu."
    >
      {done ? (
        <div className="text-center">
          <p className="text-sm text-foreground">Password berhasil diubah 🎉</p>
          <Link
            href="/login"
            className="mt-4 inline-block font-mono text-xs text-accent transition hover:opacity-80"
          >
            Masuk sekarang →
          </Link>
        </div>
      ) : !token ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Token tidak ditemukan. Buka halaman ini dari link pada email resetmu.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>
              Password Baru <span className="normal-case opacity-60">(min 8 karakter)</span>
            </label>
            <input
              className={fieldCls}
              type="password"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelCls}>Konfirmasi Password Baru</label>
            <input
              className={fieldCls}
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <FormError>{error}</FormError>
          <SubmitButton loading={loading}>{loading ? "Menyimpan…" : "Simpan Password"}</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
