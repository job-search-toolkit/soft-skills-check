"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type Lang, LANGUAGES } from "@/lib/i18n/index";

export type { Lang };

const VALID_LANGS = new Set(LANGUAGES.map((l) => l.code));

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

const BROWSER_LANG_MAP: Record<string, Lang> = {
  ru: "ru",
  en: "en",
  de: "de",
  es: "es",
  it: "it",
  kk: "kk",
  uk: "uk",
  zh: "zh",
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && VALID_LANGS.has(saved)) {
      setLangState(saved);
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0].toLowerCase();
      const mapped = BROWSER_LANG_MAP[browserLang];
      if (mapped) {
        setLangState(mapped);
      } else {
        setLangState("en");
      }
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
