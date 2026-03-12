"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Terminal, Download, Globe } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { profile } from "@/data/profile";

interface Props {
  language: "id" | "en";
  onCVOpen?: () => void;
  onLanguageToggle?: () => void;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: "32px", height: "32px", borderRadius: "8px",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
        background: hovered ? "hsl(var(--surface-2))" : "transparent",
        border: "none", cursor: "pointer",
        transition: "all 0.15s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function Navbar({ language, onCVOpen, onLanguageToggle }: Props) {
  const isMobile = useIsMobile();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex", alignItems: "center",
        padding: "0 16px", height: "52px",
        borderBottom: "1px solid hsl(var(--border))",
        background: "hsl(var(--background) / 0.9)",
        backdropFilter: "blur(12px)",
        flexShrink: 0, zIndex: 10, position: "relative",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: "hsl(var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px hsl(var(--accent) / 0.35)",
          flexShrink: 0,
        }}>
          <Terminal size={13} color="hsl(var(--accent-foreground))" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{
            fontSize: "13px", fontWeight: 600,
            color: "hsl(var(--foreground))", lineHeight: 1.2,
            fontFamily: "var(--font-geist-mono)", margin: 0,
          }}>
            {profile.name}
          </p>
          {!isMobile && (
            <p style={{
              fontSize: "10px", color: "hsl(var(--muted-foreground))",
              lineHeight: 1.2, margin: 0,
            }}>
              {profile.title}
            </p>
          )}
        </div>
      </div>

      {/* Center — status (sembunyikan di mobile kecil) */}
      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
        {/* Mobile: tampilkan CV & Language di navbar */}
        {isMobile && onCVOpen && (
          <button
            onClick={onCVOpen}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 10px", borderRadius: "7px",
              border: "1px solid hsl(var(--accent) / 0.3)",
              background: "hsl(var(--accent) / 0.08)",
              color: "hsl(var(--accent))",
              fontSize: "11px", fontFamily: "var(--font-geist-mono)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Download size={12} />
            CV
          </button>
        )}

        {isMobile && onLanguageToggle && (
          <button
            onClick={onLanguageToggle}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", cursor: "pointer",
              color: "hsl(var(--muted-foreground))",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Globe size={15} />
          </button>
        )}

        {!isMobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "3px 10px", borderRadius: "99px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--surface))",
            marginRight: "4px",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: profile.available ? "hsl(152 69% 52%)" : "hsl(0 69% 52%)",
              boxShadow: profile.available ? "0 0 5px hsl(152 69% 52% / 0.8)" : "none",
              display: "inline-block",
            }} />
            <span style={{
              fontSize: "10px", color: "hsl(var(--muted-foreground))",
              fontFamily: "var(--font-geist-mono)",
            }}>
              {profile.available
                ? (language === "id" ? "open to work" : "open to work")
                : (language === "id" ? "tidak tersedia" : "unavailable")
              }
            </span>
          </div>
        )}

        <ThemeToggle />
      </div>
    </motion.header>
  );
}
