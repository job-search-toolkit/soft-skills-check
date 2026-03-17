"use client";

import { useLang } from "@/lib/LangContext";

export default function Header() {
  const { lang, setLang } = useLang();

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
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-sm">
            <button
              onClick={() => setLang("ru")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "ru"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "en"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              EN
            </button>
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
