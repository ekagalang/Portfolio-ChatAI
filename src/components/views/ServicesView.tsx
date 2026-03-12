"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { services } from "@/data/services";
import { formatIDR } from "@/lib/utils";
import { profile } from "@/data/profile";

interface Props {
  language: "id" | "en";
}

export function ServicesView({ language }: Props) {
  return (
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
              }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--accent))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                    {formatIDR(service.pricing.starting)}
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
                      /{service.pricing.unit}
                    </span>
                  </p>
                  <p style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", margin: "2px 0 0", fontFamily: "var(--font-geist-mono)" }}>
                    ⏱ {service.duration}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${profile.contact.whatsapp}?text=Halo, saya tertarik dengan jasa ${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px", borderRadius: "8px",
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                    textDecoration: "none",
                    fontSize: "11px", fontWeight: 600,
                    fontFamily: "var(--font-geist-mono)",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <MessageCircle size={12} />
                  {language === "id" ? "Hubungi" : "Contact"}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}