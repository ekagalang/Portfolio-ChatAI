"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, CreditCard } from "lucide-react";
import { services } from "@/data/services";
import { formatIDR } from "@/lib/utils";
import { profile } from "@/data/profile";
import { PaymentModal } from "@/components/PaymentModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

type Service = (typeof services)[number];

interface Props {
  language: "id" | "en";
}

export function ServicesView({ language }: Props) {
  const [pendingService, setPendingService] = useState<Service | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <div style={{ height: "100%", overflowY: "auto", padding: "24px 20px" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "hsl(var(--foreground))", fontFamily: "var(--font-geist-mono)", marginBottom: "4px" }}>
            {language === "id" ? "Jasa" : "Services"}
          </h2>
          <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "24px" }}>
            {language === "id" ? "Layanan yang saya tawarkan" : "What I can build for you"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--surface))",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "22px", lineHeight: 1 }}>{service.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: "0 0 4px" }}>
                      {service.title}
                    </p>
                    <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.5 }}>
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Stack tags */}
                {service.stack.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                    {service.stack.map((s) => (
                      <span key={s} style={{
                        fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
                        background: "hsl(var(--surface-2))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--accent))",
                        fontFamily: "var(--font-geist-mono)",
                      }}>{s}</span>
                    ))}
                  </div>
                )}

                {/* Deliverables */}
                <div style={{ marginBottom: "12px" }}>
                  {service.deliverables.map((d) => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <Check size={11} color="hsl(var(--accent))" />
                      <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{d}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid hsl(var(--border))",
                  gap: "8px", flexWrap: "wrap",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--accent))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                      Mulai dari {formatIDR(service.pricing.starting)}
                      <span style={{ fontSize: "11px", fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
                        /{service.pricing.unit}
                      </span>
                    </p>
                    <p style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", margin: "2px 0 0", fontFamily: "var(--font-geist-mono)" }}>
                      ⏱ {service.duration} | {service.pricing.note}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {/* Pesan Sekarang */}
                    <button
                      onClick={() => setPendingService(service)}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "7px 11px", borderRadius: "8px",
                        background: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                        border: "none",
                        fontSize: "11px", fontWeight: 600,
                        fontFamily: "var(--font-geist-mono)",
                        cursor: "pointer",
                        boxShadow: "0 0 10px hsl(var(--accent) / 0.25)",
                        transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      <CreditCard size={11} />
                      {language === "id" ? "Pesan" : "Order"}
                    </button>

                    {/* Hubungi via WhatsApp */}
                    <a
                      href={`https://wa.me/${profile.contact.whatsapp}?text=Halo, saya tertarik dengan jasa ${service.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "7px 11px", borderRadius: "8px",
                        background: "transparent",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                        textDecoration: "none",
                        fontSize: "11px", fontWeight: 500,
                        fontFamily: "var(--font-geist-mono)",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.4)";
                        e.currentTarget.style.color = "hsl(var(--foreground))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "hsl(var(--border))";
                        e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                      }}
                    >
                      <MessageCircle size={11} />
                      {language === "id" ? "Tanya" : "Chat"}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <PaymentModal
        service={pendingService}
        language={language}
        onClose={() => setPendingService(null)}
        onSuccess={() => addToast(
          language === "id" ? "Pembayaran berhasil! Kami akan segera menghubungi kamu." : "Payment successful! We'll contact you soon.",
          "success", 6000
        )}
        onPending={() => addToast(
          language === "id" ? "Pembayaran sedang diproses. Cek email untuk konfirmasi." : "Payment is being processed. Check your email.",
          "info", 6000
        )}
        onError={() => addToast(
          language === "id" ? "Pembayaran gagal. Silakan coba lagi atau hubungi via WhatsApp." : "Payment failed. Please try again or contact via WhatsApp.",
          "error", 6000
        )}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
