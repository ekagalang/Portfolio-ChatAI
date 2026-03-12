"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Github, Linkedin, MessageCircle,
  Mail, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { profile } from "@/data/profile";

interface Props {
  language: "id" | "en";
}

type Status = "idle" | "loading" | "success" | "error";

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactView({ language }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const t = {
    title:     language === "id" ? "Kontak" : "Contact",
    subtitle:  language === "id" ? "Ada project? Mari diskusi." : "Have a project? Let's talk.",
    name:      language === "id" ? "Nama" : "Name",
    email:     "Email",
    message:   language === "id" ? "Pesan" : "Message",
    namePh:    language === "id" ? "Nama kamu" : "Your name",
    emailPh:   "you@email.com",
    messagePh: language === "id"
      ? "Ceritakan project atau pertanyaanmu..."
      : "Tell me about your project or question...",
    send:      language === "id" ? "Kirim Pesan" : "Send Message",
    sending:   language === "id" ? "Mengirim..." : "Sending...",
    success:   language === "id"
      ? "Pesan terkirim! Cek inbox kamu untuk konfirmasi."
      : "Message sent! Check your inbox for confirmation.",
    or:        language === "id" ? "atau hubungi langsung" : "or reach me directly",
    chars:     language === "id" ? "karakter" : "characters",
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = language === "id" ? "Nama minimal 2 karakter" : "Name must be at least 2 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = language === "id" ? "Format email tidak valid" : "Invalid email format";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = language === "id" ? "Pesan minimal 10 karakter" : "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("loading");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? (language === "id" ? "Gagal mengirim." : "Failed to send."));
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } catch {
      setServerError(language === "id" ? "Koneksi gagal. Coba via WhatsApp." : "Connection failed. Try via WhatsApp.");
      setStatus("error");
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: `1px solid ${hasError ? "hsl(0 69% 52% / 0.6)" : "hsl(var(--border))"}`,
    background: "hsl(var(--surface))",
    color: "hsl(var(--foreground))",
    fontSize: "13px",
    fontFamily: "var(--font-geist-mono)",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box" as const,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "hsl(var(--muted-foreground))",
    fontFamily: "var(--font-geist-mono)",
    display: "block",
    marginBottom: "6px",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "hsl(0 69% 62%)",
    marginTop: "4px",
    fontFamily: "var(--font-geist-mono)",
  };

  const directLinks = [
    {
      icon: <MessageCircle size={14} />,
      label: "WhatsApp",
      href: `https://wa.me/${profile.contact.whatsapp}`,
      color: "hsl(142 71% 45%)",
    },
    {
      icon: <Mail size={14} />,
      label: profile.contact.email,
      href: `mailto:${profile.contact.email}`,
      color: "hsl(var(--accent))",
    },
    {
      icon: <Github size={14} />,
      label: "GitHub",
      href: profile.contact.github,
      color: "hsl(var(--foreground))",
    },
    {
      icon: <Linkedin size={14} />,
      label: "LinkedIn",
      href: profile.contact.linkedin,
      color: "hsl(213 93% 67%)",
    },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 20px" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "hsl(var(--foreground))", fontFamily: "var(--font-geist-mono)", marginBottom: "4px" }}>
          {t.title}
        </h2>
        <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "24px" }}>
          {t.subtitle}
        </p>

        {/* Success state */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                padding: "14px 16px", borderRadius: "10px",
                background: "hsl(152 69% 52% / 0.08)",
                border: "1px solid hsl(152 69% 52% / 0.25)",
                color: "hsl(152 69% 52%)",
                fontSize: "13px", marginBottom: "20px",
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{t.success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>{t.name}</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder={t.namePh}
              style={inputStyle(!!errors.name)}
              onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
              onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
            />
            {errors.name && <p style={errorStyle}>↑ {errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>{t.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder={t.emailPh}
              style={inputStyle(!!errors.email)}
              onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
              onBlur={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
            />
            {errors.email && <p style={errorStyle}>↑ {errors.email}</p>}
          </div>

          {/* Message */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>{t.message}</label>
              <span style={{ fontSize: "10px", color: form.message.length > 1800 ? "hsl(0 69% 62%)" : "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
                {form.message.length}/2000
              </span>
            </div>
            <textarea
              value={form.message}
              onChange={(e) => {
                if (e.target.value.length > 2000) return;
                setForm({ ...form, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              placeholder={t.messagePh}
              rows={5}
              style={{ ...inputStyle(!!errors.message), resize: "none", lineHeight: 1.6 }}
              onFocus={(e) => { if (!errors.message) e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)"; }}
              onBlur={(e) => { if (!errors.message) e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
            />
            {errors.message && <p style={errorStyle}>↑ {errors.message}</p>}
          </div>

          {/* Server error */}
          {status === "error" && serverError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={status === "loading"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "11px 16px", borderRadius: "8px",
              background: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground))",
              border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 600,
              fontFamily: "var(--font-geist-mono)",
              opacity: status === "loading" ? 0.7 : 1,
              transition: "opacity 0.15s ease",
              boxShadow: "0 0 16px hsl(var(--accent) / 0.25)",
            }}
          >
            {status === "loading"
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {t.sending}</>
              : <><Send size={14} /> {t.send}</>
            }
          </motion.button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
          <span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
            {t.or}
          </span>
          <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
        </div>

        {/* Direct links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {directLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--surface))",
                color: item.color,
                textDecoration: "none",
                fontSize: "12px",
                fontFamily: "var(--font-geist-mono)",
                transition: "border-color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.background = "hsl(var(--surface-2))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.background = "hsl(var(--surface))";
              }}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>

      </motion.div>
    </div>
  );
}