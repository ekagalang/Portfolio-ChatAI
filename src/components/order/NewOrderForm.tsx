"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { services } from "@/data/services";
import { formatIDR } from "@/lib/utils";
import { AuthShell, FormError, SubmitButton, fieldCls, labelCls } from "@/components/auth/ui";

export function NewOrderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("service") ?? services[0].id;

  const [serviceId, setServiceId] = useState(initial);
  const [brief, setBrief] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? services[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, brief, phone: phone || undefined }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Gagal mengirim permintaan.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthShell
      className="max-w-md"
      backHref="/dashboard/pesan"
      backLabel="Pesan Jasa"
      eyebrow="Pesan Jasa"
      title="Ajukan Permintaan"
      subtitle="Ceritakan kebutuhanmu. Saya akan tinjau & kirim penawaran harga + DP — belum ada pembayaran di tahap ini."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Jasa</label>
          <select
            className={`${fieldCls} cursor-pointer`}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={loading}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.title}
              </option>
            ))}
          </select>
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            Estimasi mulai{" "}
            <span className="text-foreground">{formatIDR(service.pricing.starting)}</span> — harga
            final menyesuaikan kebutuhan.
          </p>
        </div>

        <div>
          <label className={labelCls}>Deskripsi Kebutuhan</label>
          <textarea
            className={`${fieldCls} min-h-28 resize-y leading-relaxed`}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            required
            minLength={10}
            disabled={loading}
            placeholder="Jelaskan proyek: tujuan, fitur utama, referensi, target waktu…"
          />
        </div>

        <div>
          <label className={labelCls}>
            No. HP <span className="normal-case opacity-60">(opsional, untuk koordinasi)</span>
          </label>
          <input
            className={fieldCls}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            placeholder="08xxxxxxxxxx"
            autoComplete="tel"
          />
        </div>

        <FormError>{error}</FormError>
        <SubmitButton loading={loading}>
          {loading ? "Mengirim…" : "Kirim Permintaan"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
