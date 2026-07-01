"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell, FormError, SubmitButton, fieldCls, labelCls } from "./ui";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
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
      eyebrow="Lupa Password"
      title="Reset Password"
      subtitle="Masukkan email akunmu — kami kirim link untuk membuat password baru."
    >
      {sent ? (
        <div className="text-center">
          <p className="text-sm leading-relaxed text-foreground">
            Jika email terdaftar, link reset sudah dikirim. Cek inbox (dan folder spam) kamu.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block font-mono text-xs text-accent transition hover:opacity-80"
          >
            ← Kembali ke Masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              className={fieldCls}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <FormError>{error}</FormError>
          <SubmitButton loading={loading}>{loading ? "Mengirim…" : "Kirim Link Reset"}</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
