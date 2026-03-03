"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const canSend = value.trim() && !isLoading;

  return (
    <div style={{
      padding: "12px 16px 16px",
      borderTop: "1px solid hsl(var(--border))",
      background: "hsl(var(--background))",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "10px",
        padding: "10px 14px",
        borderRadius: "12px",
        border: `1px solid ${focused ? "hsl(var(--accent) / 0.5)" : "hsl(var(--border))"}`,
        background: "hsl(var(--surface))",
        transition: "border-color 0.2s ease",
        boxShadow: focused ? "0 0 0 3px hsl(var(--accent) / 0.08)" : "none",
      }}>
        {/* Prefix */}
        <span style={{
          fontSize: "13px", color: "hsl(var(--accent))",
          fontFamily: "var(--font-geist-mono)",
          flexShrink: 0, paddingBottom: "1px",
          opacity: focused || value ? 1 : 0.5,
          transition: "opacity 0.2s",
        }}>
          &gt;
        </span>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isLoading ? "generating..." : "ask me anything..."}
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1, background: "transparent", resize: "none",
            outline: "none", border: "none",
            fontSize: "13px", lineHeight: 1.6,
            color: "hsl(var(--foreground))",
            fontFamily: "var(--font-geist-mono)",
            maxHeight: "120px",
            cursor: isLoading ? "not-allowed" : "text",
          }}
        />

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: "28px", height: "28px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: canSend ? "hsl(var(--accent))" : "hsl(var(--surface-2))",
            color: canSend ? "hsl(var(--accent-foreground))" : "hsl(var(--muted-foreground))",
            border: "none", cursor: canSend ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all 0.15s ease",
            boxShadow: canSend ? "0 0 12px hsl(var(--accent) / 0.3)" : "none",
          }}
        >
          {isLoading
            ? <Square size={11} style={{ animation: "pulse-soft 1.5s ease-in-out infinite" }} />
            : <ArrowUp size={13} strokeWidth={2.5} />
          }
        </motion.button>
      </div>

      <p style={{
        textAlign: "center", fontSize: "10px", marginTop: "6px",
        color: "hsl(var(--muted-foreground))",
        fontFamily: "var(--font-geist-mono)",
        letterSpacing: "0.05em",
      }}>
        enter ↵ to send · shift+enter for newline
      </p>
    </div>
  );
}