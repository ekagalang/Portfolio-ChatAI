"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  language: "id" | "en";
}

export function CVModal({ open, onClose, language }: Props) {
  // Close dengan ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll saat modal buka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const t = {
    title:    language === "id" ? "Curriculum Vitae" : "Curriculum Vitae",
    download: language === "id" ? "Download CV" : "Download CV",
    open:     language === "id" ? "Buka di tab baru" : "Open in new tab",
    close:    language === "id" ? "Tutup" : "Close",
    loading:  language === "id" ? "Memuat CV..." : "Loading CV...",
    noPreview: language === "id"
      ? "Preview tidak tersedia di browser ini."
      : "Preview not available in this browser.",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "hsl(220 16% 4% / 0.85)",
              backdropFilter: "blur(4px)",
              zIndex: 50,
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: "5%",
              zIndex: 51,
              display: "flex",
              flexDirection: "column",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
              boxShadow: "0 24px 80px hsl(220 16% 4% / 0.6)",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--background))",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "hsl(var(--accent))",
                  boxShadow: "0 0 6px hsl(var(--accent) / 0.6)",
                }} />
                <p style={{
                  fontSize: "13px", fontWeight: 600,
                  color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-geist-mono)",
                  margin: 0,
                }}>
                  {t.title}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Open in new tab */}
                <a
                  href="/cv.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t.open}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 10px", borderRadius: "7px",
                    border: "1px solid hsl(var(--border))",
                    background: "transparent",
                    color: "hsl(var(--muted-foreground))",
                    textDecoration: "none",
                    fontSize: "11px", fontFamily: "var(--font-geist-mono)",
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
                  <ExternalLink size={12} />
                  {t.open}
                </a>

                {/* Download */}
                <a
                  href="/cv.pdf"
                  download="CV-Galang.pdf"
                  title={t.download}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "7px",
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                    textDecoration: "none",
                    fontSize: "11px", fontWeight: 600,
                    fontFamily: "var(--font-geist-mono)",
                    boxShadow: "0 0 12px hsl(var(--accent) / 0.3)",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <Download size={12} />
                  {t.download}
                </a>

                {/* Close */}
                <button
                  onClick={onClose}
                  style={{
                    width: "30px", height: "30px", borderRadius: "7px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(var(--surface-2))";
                    e.currentTarget.style.color = "hsl(var(--foreground))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div style={{ flex: 1, position: "relative", background: "hsl(220 16% 6%)" }}>
            {/* Loading indicator */}
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "8px", color: "hsl(var(--muted-foreground))",
                fontFamily: "var(--font-geist-mono)", fontSize: "12px",
                zIndex: 0,
            }}>
                <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: "2px solid hsl(var(--border))",
                borderTopColor: "hsl(var(--accent))",
                animation: "spin 1s linear infinite",
                }} />
                {t.loading}
            </div>

            {/* object tag lebih compatible dari iframe untuk PDF */}
            <object
                data="/cv.pdf"
                type="application/pdf"
                style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                zIndex: 1,
                }}
            >
                {/* Fallback kalau object juga tidak bisa */}
                <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "12px", zIndex: 2,
                background: "hsl(var(--surface))",
                }}>
                <p style={{
                    fontSize: "13px", color: "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-geist-mono)", textAlign: "center",
                    maxWidth: "280px", lineHeight: 1.6,
                }}>
                    Preview tidak tersedia.<br />
                    Gunakan tombol di atas untuk membuka atau download CV.
                </p>
                <a
                    href="/cv.pdf"
                    download="CV-Galang.pdf"
                    style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px", borderRadius: "8px",
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                    textDecoration: "none", fontSize: "13px",
                    fontWeight: 600, fontFamily: "var(--font-geist-mono)",
                    }}
                >
                    <Download size={14} />
                    Download CV
                </a>
                </div>
            </object>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}