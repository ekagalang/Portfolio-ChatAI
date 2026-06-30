"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AuthShell,
  Divider,
  FormError,
  GoogleButton,
  SubmitButton,
  fieldCls,
  labelCls,
} from "./ui";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Gagal mendaftar.");
      setLoading(false);
      return;
    }

    // Auto login setelah daftar
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Mulai pesan jasa"
      title="Daftar Akun"
      subtitle="Buat akun untuk memesan jasa, terima penawaran, dan bayar dengan aman."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-accent transition hover:opacity-80">
            Masuk
          </Link>
        </>
      }
    >
      <GoogleButton onClick={() => signIn("google", { callbackUrl: "/dashboard" })} />

      <div className="my-5">
        <Divider />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Nama Lengkap</label>
          <input
            className={fieldCls}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            placeholder="John Doe"
            autoComplete="name"
          />
        </div>
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
        <div>
          <label className={labelCls}>
            Password <span className="normal-case opacity-60">(min 8 karakter)</span>
          </label>
          <input
            className={fieldCls}
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <FormError>{error}</FormError>
        <SubmitButton loading={loading}>{loading ? "Memproses…" : "Daftar"}</SubmitButton>
      </form>
    </AuthShell>
  );
}
