"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ru" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && (saved === "ru" || saved === "en")) {
      setLangState(saved);
    } else if (typeof navigator !== "undefined" && !navigator.language.startsWith("ru")) {
      setLangState("en");
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
