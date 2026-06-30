"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Selamat datang kembali"
      title="Masuk"
      subtitle="Pantau pesanan, progres pengerjaan, dan pembayaran di dashboard."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-accent transition hover:opacity-80">
            Daftar
          </Link>
        </>
      }
    >
      <GoogleButton onClick={() => signIn("google", { callbackUrl })} />

      <div className="my-5">
        <Divider />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <label className={labelCls}>Password</label>
          <input
            className={fieldCls}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <FormError>{error}</FormError>
        <SubmitButton loading={loading}>{loading ? "Memproses…" : "Masuk"}</SubmitButton>
      </form>
    </AuthShell>
  );
}
