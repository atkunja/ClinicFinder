"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Translations } from "./types";
import en from "./locales/en.json";
import es from "./locales/es.json";

export type Lang = "en" | "es";

const dictionaries: Record<Lang, Translations> = { en, es };

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: en,
});

const STORAGE_KEY = "zbi-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es") setLangState("es");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
  }, []);

  const t = dictionaries[lang];

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Simple template interpolation: tpl("Showing {count} clinics", { count: 12 }) */
export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
