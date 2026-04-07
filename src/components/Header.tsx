"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { LANGUAGES } from "@/lib/i18n/index";
import type { Lang } from "@/lib/LangContext";
import WordIdBadge from "./WordIdBadge";

export default function Header() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <header className="border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            S
          </div>
          <span className="font-semibold text-slate-100">
            Soft Skills Check
          </span>
        </a>
        <div className="flex items-center gap-3">
          <WordIdBadge />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
            >
              {lang.toUpperCase()}
              <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 min-w-[56px]">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setOpen(false); }}
                    className={`w-full px-3 py-1.5 text-sm text-left transition-colors ${
                      lang === l.code
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="https://github.com/job-search-toolkit/soft-skills-check"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
