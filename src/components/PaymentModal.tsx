"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { services } from "@/data/services";
import type { DuitkuJsCallbackResult } from "@/types/payment";

declare global {
  interface Window {
    checkout?: {
      process: (
        reference: string,
        options?: {
          defaultLanguage?: string;
          successEvent?: (result: DuitkuJsCallbackResult) => void;
          pendingEvent?: (result: DuitkuJsCallbackResult) => void;
          errorEvent?: (result: DuitkuJsCallbackResult) => void;
          closeEvent?: (result: DuitkuJsCallbackResult) => void;
        }
      ) => void;
    };
  }
}

type Service = (typeof services)[number];

interface Props {
  service: Service | null;
  language: "id" | "en";
  onClose: () => void;
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
}

export function PaymentModal({ service, language, onClose, onSuccess, onPending, onError }: Props) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const open = service !== null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset form setiap modal buka
  useEffect(() => {
    if (open) { setName(""); setEmail(""); setPhone(""); setNotes(""); setError(null); setLoading(false); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: name,
          email,
          phoneNumber: phone || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal membuat transaksi");
        setLoading(false);
        return;
      }

      onClose();

      if (typeof window.checkout?.process === "function") {
        window.checkout.process(data.reference, {
          defaultLanguage: language,
          successEvent: () => onSuccess(),
          pendingEvent: () => onPending(),
          errorEvent:   () => onError(),
          closeEvent:   () => { /* user tutup popup tanpa bayar */ },
        });
      } else {
        // Fallback jika Duitku JS belum load
        window.open(data.paymentUrl, "_blank");
      }
    } catch {
      setError("Koneksi gagal, coba lagi");
      setLoading(false);
    }
  };

  const input: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--surface-2))",
    color: "hsl(var(--foreground))",
    fontSize: "12px", fontFamily: "var(--font-geist-mono)",
    outline: "none", boxSizing: "border-box",
  };

  const label: React.CSSProperties = {
    fontSize: "11px", color: "hsl(var(--muted-foreground))",
    fontFamily: "var(--font-geist-mono)", marginBottom: "5px", display: "block",
  };

  return (
    <AnimatePresence>
      {open && service && (
        <>
          <motion.div
            key="pay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "hsl(220 16% 4% / 0.85)",
              backdropFilter: "blur(4px)",
              zIndex: 60,
            }}
          />

          {/* Wrapper untuk centering — flexbox agar tidak konflik dengan transform Framer Motion */}
          <div
            style={{
              position: "fixed", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 61, pointerEvents: "none",
              padding: "20px",
            }}
          >
          <motion.div
            key="pay-modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              pointerEvents: "auto",
              width: "min(420px, 92vw)",
              borderRadius: "14px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
              boxShadow: "0 24px 80px hsl(220 16% 4% / 0.6)",
              overflow: "hidden",
              maxHeight: "90dvh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--background))",
              position: "sticky", top: 0, zIndex: 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={14} color="hsl(var(--accent))" />
                <p style={{
                  fontSize: "13px", fontWeight: 600,
                  color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-geist-mono)", margin: 0,
                }}>
                  {language === "id" ? "Pesan Jasa" : "Order Service"}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: "28px", height: "28px", borderRadius: "7px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--muted-foreground))",
                  cursor: "pointer",
                }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Service summary */}
            <div style={{
              padding: "12px 18px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface-2))",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0 }}>
                  {service.icon} {service.title}
                </p>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: "3px 0 0", fontFamily: "var(--font-geist-mono)" }}>
                  {language === "id" ? "Mulai dari" : "Starting from"} {formatIDR(service.pricing.starting)}
                </p>
              </div>
              <span style={{
                fontSize: "10px", padding: "3px 8px", borderRadius: "5px",
                background: "hsl(var(--accent) / 0.12)",
                color: "hsl(var(--accent))",
                fontFamily: "var(--font-geist-mono)",
              }}>
                {language === "id" ? "Uang muka" : "Down payment"}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={label}>{language === "id" ? "Nama Lengkap" : "Full Name"} *</label>
                <input
                  type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  required placeholder="John Doe"
                  style={input} disabled={loading}
                />
              </div>

              <div>
                <label style={label}>Email *</label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required placeholder="you@example.com"
                  style={input} disabled={loading}
                />
              </div>

              <div>
                <label style={label}>
                  {language === "id" ? "No. HP" : "Phone"}{" "}
                  <span style={{ opacity: 0.55 }}>(opsional)</span>
                </label>
                <input
                  type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  style={input} disabled={loading}
                />
              </div>

              <div>
                <label style={label}>
                  {language === "id" ? "Catatan Proyek" : "Project Notes"}{" "}
                  <span style={{ opacity: 0.55 }}>(opsional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === "id" ? "Jelaskan kebutuhan proyek kamu..." : "Describe your project needs..."}
                  rows={3}
                  style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
                  disabled={loading}
                />
              </div>

              {error && (
                <p style={{ fontSize: "12px", color: "hsl(0 69% 62%)", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "10px 16px", borderRadius: "9px",
                  background: loading ? "hsl(var(--muted))" : "hsl(var(--accent))",
                  color: "hsl(var(--accent-foreground))",
                  border: "none", fontSize: "13px", fontWeight: 600,
                  fontFamily: "var(--font-geist-mono)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s ease",
                  boxShadow: loading ? "none" : "0 0 12px hsl(var(--accent) / 0.3)",
                  marginTop: "4px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    {language === "id" ? "Memproses..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    {language === "id" ? "Lanjut Pembayaran" : "Proceed to Payment"}
                  </>
                )}
              </button>

              <p style={{
                fontSize: "10px", color: "hsl(var(--muted-foreground))",
                textAlign: "center", margin: 0,
                fontFamily: "var(--font-geist-mono)", lineHeight: 1.6,
              }}>
                {language === "id"
                  ? "Pembayaran aman via Duitku. Harga final dikonfirmasi setelah diskusi."
                  : "Secure payment via Duitku. Final price confirmed after discussion."}
              </p>
            </form>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
