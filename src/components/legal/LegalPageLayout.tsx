"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, subtitle, updatedAt, children }: Props) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      padding: "0 20px 60px",
    }}>
      {/* Top bar */}
      <div style={{
        maxWidth: "680px", margin: "0 auto",
        paddingTop: "24px", paddingBottom: "24px",
        borderBottom: "1px solid hsl(var(--border))",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "12px", color: "hsl(var(--muted-foreground))",
            textDecoration: "none", fontFamily: "var(--font-geist-mono)",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
        >
          <ArrowLeft size={13} />
          Kembali ke Portfolio
        </Link>

        <span style={{
          fontSize: "11px", color: "hsl(var(--accent))",
          fontFamily: "var(--font-geist-mono)",
        }}>
          ekagalang.my.id
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", paddingTop: "40px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{
            fontSize: "11px", color: "hsl(var(--accent))",
            fontFamily: "var(--font-geist-mono)",
            textTransform: "uppercase", letterSpacing: "0.1em",
            margin: "0 0 8px",
          }}>
            Galang — Freelance Developer
          </p>
          <h1 style={{
            fontSize: "24px", fontWeight: 700,
            color: "hsl(var(--foreground))",
            fontFamily: "var(--font-geist-mono)",
            margin: "0 0 8px", lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: "13px", color: "hsl(var(--muted-foreground))",
              margin: "0 0 6px", lineHeight: 1.6,
            }}>
              {subtitle}
            </p>
          )}
          {updatedAt && (
            <p style={{
              fontSize: "11px", color: "hsl(var(--muted-foreground))",
              fontFamily: "var(--font-geist-mono)", margin: 0, opacity: 0.6,
            }}>
              Terakhir diperbarui: {updatedAt}
            </p>
          )}
        </div>

        <div style={{ height: "1px", background: "hsl(var(--border))", marginBottom: "32px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "48px", paddingTop: "24px",
          borderTop: "1px solid hsl(var(--border))",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{
            fontSize: "11px", color: "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-geist-mono)", margin: 0,
          }}>
            © 2025 Galang. Semua hak dilindungi.
          </p>
          <Link
            href="/"
            style={{
              fontSize: "11px", color: "hsl(var(--accent))",
              fontFamily: "var(--font-geist-mono)", textDecoration: "none",
            }}
          >
            ← Kembali ke Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontSize: "14px", fontWeight: 600,
        color: "hsl(var(--foreground))",
        fontFamily: "var(--font-geist-mono)",
        margin: "0 0 12px",
        paddingLeft: "12px",
        borderLeft: "2px solid hsl(var(--accent))",
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "13px", color: "hsl(var(--muted-foreground))",
      lineHeight: 1.8, margin: 0,
    }}>
      {children}
    </p>
  );
}

export function LegalLi({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <span style={{
        width: "4px", height: "4px", borderRadius: "50%",
        background: "hsl(var(--accent))",
        flexShrink: 0, marginTop: "9px",
      }} />
      <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.8, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

export function LegalQ({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: "16px", borderRadius: "10px",
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--surface))",
    }}>
      <p style={{
        fontSize: "13px", fontWeight: 600,
        color: "hsl(var(--foreground))",
        fontFamily: "var(--font-geist-mono)",
        margin: "0 0 6px",
      }}>
        {question}
      </p>
      <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.8, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
