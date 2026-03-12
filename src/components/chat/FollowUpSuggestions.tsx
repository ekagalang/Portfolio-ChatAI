"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  suggestions: string[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
  language: "id" | "en";
}

export function FollowUpSuggestions({ suggestions, onSelect, disabled, language }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: "4px 16px 8px" }}
    >
      {/* Label */}
      <div style={{
        display: "flex", alignItems: "center", gap: "5px",
        marginBottom: "8px",
      }}>
        <Sparkles size={10} color="hsl(var(--accent))" />
        <span style={{
          fontSize: "10px", letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground))",
          fontFamily: "var(--font-geist-mono)",
        }}>
          {language === "id" ? "lanjutkan dengan" : "continue with"}
        </span>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <AnimatePresence>
          {suggestions.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.07, duration: 0.2 }}
              onClick={() => onSelect(s)}
              disabled={disabled}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "99px",
                border: "1px solid hsl(var(--accent) / 0.2)",
                background: "hsl(var(--accent) / 0.05)",
                color: "hsl(var(--muted-foreground))",
                fontSize: "12px", fontFamily: "var(--font-geist-mono)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (disabled) return;
                const el = e.currentTarget;
                el.style.borderColor = "hsl(var(--accent) / 0.5)";
                el.style.background  = "hsl(var(--accent) / 0.1)";
                el.style.color       = "hsl(var(--foreground))";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "hsl(var(--accent) / 0.2)";
                el.style.background  = "hsl(var(--accent) / 0.05)";
                el.style.color       = "hsl(var(--muted-foreground))";
              }}
            >
              <span style={{ color: "hsl(var(--accent))", fontSize: "10px", flexShrink: 0 }}>
                ▸
              </span>
              {s}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}