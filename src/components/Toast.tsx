"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 size={14} />,
  error:   <AlertCircle size={14} />,
  info:    <Info size={14} />,
};

const COLORS = {
  success: {
    bg:     "hsl(152 69% 52% / 0.1)",
    border: "hsl(152 69% 52% / 0.25)",
    color:  "hsl(152 69% 52%)",
  },
  error: {
    bg:     "hsl(0 69% 52% / 0.1)",
    border: "hsl(0 69% 52% / 0.25)",
    color:  "hsl(0 69% 62%)",
  },
  info: {
    bg:     "hsl(var(--accent) / 0.1)",
    border: "hsl(var(--accent) / 0.25)",
    color:  "hsl(var(--accent))",
  },
};

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const c = COLORS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.color,
                fontSize: "13px",
                fontFamily: "var(--font-geist-mono)",
                pointerEvents: "auto",
                boxShadow: "0 8px 24px hsl(220 16% 4% / 0.4)",
                minWidth: "240px",
                maxWidth: "360px",
              }}
            >
              {ICONS[toast.type]}
              <span style={{ flex: 1, color: "hsl(var(--foreground))", fontSize: "12px" }}>
                {toast.message}
              </span>
              <button
                onClick={() => onRemove(toast.id)}
                style={{
                  background: "transparent", border: "none",
                  cursor: "pointer", color: "hsl(var(--muted-foreground))",
                  display: "flex", alignItems: "center", padding: 0,
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}