"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, t, type Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  t: ReturnType<typeof t>;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial);
  const router = useRouter();

  const toggle = useCallback(() => {
    const next: Lang = lang === "id" ? "en" : "id";
    // 1 tahun, path root agar terbaca server components di seluruh dashboard
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLang(next);
    router.refresh(); // re-render server components dengan bahasa baru
  }, [lang, router]);

  return <Ctx.Provider value={{ lang, toggle, t: t(lang) }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within <LangProvider>");
  return ctx;
}
