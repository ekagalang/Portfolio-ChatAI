"use client";

import { motion } from "framer-motion";

interface Props {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const QUICK_PROMPTS = [
  { icon: "▸", label: "Tentang saya", prompt: "Ceritakan tentang dirimu dan background kamu sebagai developer." },
  { icon: "▸", label: "Tech stack", prompt: "Apa saja tech stack dan skill yang kamu kuasai?" },
  { icon: "▸", label: "Project", prompt: "Tunjukkan project-project yang pernah kamu buat." },
  { icon: "▸", label: "Jasa & harga", prompt: "Apa saja jasa yang kamu tawarkan dan berapa harganya?" },
  { icon: "▸", label: "Hire me", prompt: "Saya tertarik untuk hire kamu. Bagaimana cara menghubungimu?" },
  { icon: "▸", label: "Pengalaman", prompt: "Ceritakan pengalaman kerja dan pendidikan kamu." },
];

export function QuickPrompts({ onSelect, disabled }: Props) {
  return (
    <div style={{ padding: "0 16px 12px" }}>
      <p style={{
        fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
        color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)",
        marginBottom: "8px",
      }}>
        suggested
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {QUICK_PROMPTS.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.25 }}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 12px", borderRadius: "6px",
              background: "hsl(var(--surface))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
              fontSize: "12px", fontFamily: "var(--font-geist-mono)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              if (disabled) return;
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "hsl(var(--accent) / 0.5)";
              el.style.color = "hsl(var(--accent))";
              el.style.background = "hsl(var(--accent) / 0.06)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "hsl(var(--border))";
              el.style.color = "hsl(var(--muted-foreground))";
              el.style.background = "hsl(var(--surface))";
            }}
          >
            <span style={{ color: "hsl(var(--accent))", fontSize: "10px" }}>{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}