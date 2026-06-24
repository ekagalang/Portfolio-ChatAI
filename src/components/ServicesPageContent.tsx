"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, CreditCard } from "lucide-react";
import { services } from "@/data/services";
import { profile } from "@/data/profile";
import { formatIDR } from "@/lib/utils";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PaymentModal } from "@/components/PaymentModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

type Service = (typeof services)[number];

export function ServicesPageContent() {
  const [pendingService, setPendingService] = useState<Service | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <LegalPageLayout
        title="Jasa"
        subtitle="Layanan yang saya tawarkan — dari web app fullstack hingga landing page dan API backend."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--surface))",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px", lineHeight: 1 }}>{service.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "hsl(var(--foreground))", margin: "0 0 4px" }}>
                    {service.title}
                  </p>
                  <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.6 }}>
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Stack tags */}
              {service.stack.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                  {service.stack.map((s) => (
                    <span key={s} style={{
                      fontSize: "11px", padding: "3px 8px", borderRadius: "5px",
                      background: "hsl(var(--surface-2))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--accent))",
                      fontFamily: "var(--font-geist-mono)",
                    }}>{s}</span>
                  ))}
                </div>
              )}

              {/* Deliverables */}
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {service.deliverables.map((d) => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Check size={12} color="hsl(var(--accent))" />
                    <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>{d}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: "14px", borderTop: "1px solid hsl(var(--border))",
                gap: "10px", flexWrap: "wrap",
              }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "hsl(var(--accent))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                    Mulai dari {formatIDR(service.pricing.starting)}
                    <span style={{ fontSize: "12px", fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
                      /{service.pricing.unit}
                    </span>
                  </p>
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: "3px 0 0", fontFamily: "var(--font-geist-mono)" }}>
                    ⏱ {service.duration} | {service.pricing.note}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => setPendingService(service)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px",
                      background: "hsl(var(--accent))",
                      color: "hsl(var(--accent-foreground))",
                      border: "none", fontSize: "12px", fontWeight: 600,
                      fontFamily: "var(--font-geist-mono)",
                      cursor: "pointer",
                      boxShadow: "0 0 10px hsl(var(--accent) / 0.25)",
                      transition: "opacity 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <CreditCard size={12} />
                    Pesan
                  </button>

                  <a
                    href={`https://wa.me/${profile.contact.whatsapp}?text=Halo, saya tertarik dengan jasa ${service.title}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px",
                      background: "transparent",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--muted-foreground))",
                      textDecoration: "none",
                      fontSize: "12px", fontWeight: 500,
                      fontFamily: "var(--font-geist-mono)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(142 71% 45%)"; e.currentTarget.style.color = "hsl(142 71% 45%)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
                  >
                    <MessageCircle size={12} />
                    Tanya
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </LegalPageLayout>

      <PaymentModal
        service={pendingService}
        language="id"
        onClose={() => setPendingService(null)}
        onSuccess={() => addToast("Pembayaran berhasil! Kami akan segera menghubungi kamu.", "success", 6000)}
        onPending={() => addToast("Pembayaran sedang diproses. Cek email untuk konfirmasi.", "info", 6000)}
        onError={() => addToast("Pembayaran gagal. Silakan coba lagi atau hubungi via WhatsApp.", "error", 6000)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
