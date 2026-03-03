"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Github, Linkedin, Terminal } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { profile } from "@/data/profile";

const iconBtnStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
};

function IconBtn({
  href,
  onClick,
  label,
  children,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    ...iconBtnStyle,
    background: hovered ? "hsl(var(--surface-2))" : "transparent",
    color: hovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "56px",
        borderBottom: "1px solid hsl(var(--border))",
        background: "hsl(var(--background) / 0.85)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "hsl(var(--accent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px hsl(var(--accent) / 0.4)",
          }}
        >
          <Terminal size={15} color="hsl(var(--accent-foreground))" strokeWidth={2.5} />
        </div>
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "hsl(var(--foreground))",
              lineHeight: 1.2,
              fontFamily: "var(--font-geist-mono)",
              margin: 0,
            }}
          >
            {profile.name}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "hsl(var(--muted-foreground))",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {profile.title}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "99px",
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--surface))",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: profile.available ? "hsl(152 69% 52%)" : "hsl(0 69% 52%)",
            boxShadow: profile.available ? "0 0 6px hsl(152 69% 52% / 0.8)" : "none",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            color: "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          {profile.available ? "open to work" : "unavailable"}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <IconBtn href={profile.contact.github} label="GitHub">
          <Github size={15} />
        </IconBtn>

        <IconBtn href={profile.contact.linkedin} label="LinkedIn">
          <Linkedin size={15} />
        </IconBtn>

        <IconBtn onClick={toggleTheme} label="Toggle theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </IconBtn>
      </div>
    </motion.header>
  );
}