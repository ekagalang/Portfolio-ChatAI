"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Github, Linkedin, MessageCircle,
  Mail, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { profile } from "@/data/profile";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

type Status = "idle" | "loading" | "success" | "error";
interface FormErrors { name?: string; email?: string; message?: string; }

export function ContactPageContent() {
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [status, setStatus]       = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Nama minimal 2 karakter";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Pesan minimal 10 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("loading");
    setServerError("");
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "Gagal mengirim."); setStatus("error"); return; }
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } catch {
      setServerError("Koneksi gagal. Coba via WhatsApp.");
      setStatus("error");
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 13px", borderRadius: "9px",
    border: `1px solid ${hasError ? "hsl(0 69% 52% / 0.6)" : "hsl(var(--border))"}`,
    background: "hsl(var(--surface))", color: "hsl(var(--foreground))",
    fontSize: "13px", fontFamily: "var(--font-geist-mono)",
    outline: "none", transition: "border-color 0.15s ease",
    boxSizing: "border-box" as const,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: "10px", letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "hsl(var(--muted-foreground))",
    fontFamily: "var(--font-geist-mono)",
    display: "block", marginBottom: "6px",
  };

  const directLinks = [
    { icon: <MessageCircle size={14} />, label: "WhatsApp", href: `https://wa.me/${profile.contact.whatsapp}`, color: "hsl(142 71% 45%)" },
    { icon: <Mail size={14} />,          label: profile.contact.email, href: `mailto:${profile.contact.email}`, color: "hsl(var(--accent))" },
    { icon: <Github size={14} />,        label: "GitHub", href: profile.contact.github, color: "hsl(var(--foreground))" },
    { icon: <Linkedin size={14} />,      label: "LinkedIn", href: profile.contact.linkedin, color: "hsl(213 93% 67%)" },
  ];

  return (
    <LegalPageLayout
      title="Kontak"
      subtitle="Ada project atau pertanyaan? Isi form di bawah atau hubungi langsung."
    >
      {/* Success banner */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "14px 16px", borderRadius: "10px",
              background: "hsl(152 69% 52% / 0.08)",
              border: "1px solid hsl(152 69% 52% / 0.25)",
              color: "hsl(152 69% 52%)", fontSize: "13px",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>Pesan terkirim! Cek inbox kamu untuk konfirmasi.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <div style={{
        padding: "24px", borderRadius: "12px",
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--surface))",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        <div>
          <label style={labelStyle}>Nama</label>
          <input
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
            placeholder="Nama kamu"
            style={inputStyle(!!errors.name)}
            onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
            onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
          />
          {errors.name && <p style={{ fontSize: "11px", color: "hsl(0 69% 62%)", marginTop: "4px", fontFamily: "var(--font-geist-mono)" }}>↑ {errors.name}</p>}
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email" value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
            placeholder="you@email.com"
            style={inputStyle(!!errors.email)}
            onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
            onBlur={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
          />
          {errors.email && <p style={{ fontSize: "11px", color: "hsl(0 69% 62%)", marginTop: "4px", fontFamily: "var(--font-geist-mono)" }}>↑ {errors.email}</p>}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Pesan</label>
            <span style={{ fontSize: "10px", color: form.message.length > 1800 ? "hsl(0 69% 62%)" : "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
              {form.message.length}/2000
            </span>
          </div>
          <textarea
            value={form.message}
            onChange={(e) => { if (e.target.value.length > 2000) return; setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: undefined }); }}
            placeholder="Ceritakan project atau pertanyaanmu..."
            rows={6}
            style={{ ...inputStyle(!!errors.message), resize: "none", lineHeight: 1.6 }}
            onFocus={(e) => { if (!errors.message) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
            onBlur={(e) => { if (!errors.message) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
          />
          {errors.message && <p style={{ fontSize: "11px", color: "hsl(0 69% 62%)", marginTop: "4px", fontFamily: "var(--font-geist-mono)" }}>↑ {errors.message}</p>}
        </div>

        {status === "error" && serverError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "8px",
              background: "hsl(0 69% 52% / 0.08)",
              border: "1px solid hsl(0 69% 52% / 0.2)",
              color: "hsl(0 69% 62%)", fontSize: "12px",
            }}
          >
            <AlertCircle size={13} />
            {serverError}
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={status === "loading"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "11px 16px", borderRadius: "9px",
            background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))",
            border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-geist-mono)",
            opacity: status === "loading" ? 0.7 : 1,
            transition: "opacity 0.15s ease",
            boxShadow: "0 0 16px hsl(var(--accent) / 0.25)",
          }}
        >
          {status === "loading"
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Mengirim...</>
            : <><Send size={14} /> Kirim Pesan</>}
        </motion.button>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
        <span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
          atau hubungi langsung
        </span>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
      </div>

      {/* Direct links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {directLinks.map((item) => (
          <a
            key={item.label} href={item.href}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 16px", borderRadius: "10px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
              color: item.color, textDecoration: "none",
              fontSize: "13px", fontFamily: "var(--font-geist-mono)",
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = "hsl(var(--surface-2))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.background = "hsl(var(--surface))"; }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      {/* Legal links */}
      <div style={{
        padding: "16px", borderRadius: "10px",
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--surface-2))",
        display: "flex", flexWrap: "wrap", gap: "16px",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
          Info lainnya:
        </span>
        {[
          { href: "/faq",    label: "FAQ" },
          { href: "/terms",  label: "Syarat & Ketentuan" },
          { href: "/refund", label: "Kebijakan Refund" },
        ].map((l) => (
          <Link
            key={l.href} href={l.href}
            style={{ fontSize: "11px", color: "hsl(var(--accent))", fontFamily: "var(--font-geist-mono)", textDecoration: "none" }}
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </LegalPageLayout>
  );
}
