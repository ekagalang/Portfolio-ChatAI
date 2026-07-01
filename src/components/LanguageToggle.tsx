"use client";

import { Globe } from "lucide-react";
import { useLang } from "@/components/LangProvider";

export function LanguageToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-mono text-xs text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
    >
      <Globe className="size-4" />
      {lang.toUpperCase()}
    </button>
  );
}
