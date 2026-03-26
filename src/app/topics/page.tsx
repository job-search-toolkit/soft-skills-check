"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { dimensions } from "@/lib/questions";

const TOPIC_ICONS: Record<string, string> = {
  critical_thinking: "\uD83D\uDD0D",
  communication: "\uD83D\uDCAC",
  adaptability: "\u26A1",
  self_organization: "\uD83D\uDCCB",
  product_thinking: "\uD83C\uDFAF",
  collaboration: "\uD83E\uDD1D",
  leadership: "\uD83D\uDE80",
  conflict_resolution: "\uD83E\uDDD1\u200D\u2696\uFE0F",
  emotional_intelligence: "\uD83D\uDCA1",
  time_management: "\u23F1\uFE0F",
  management_skills: "\uD83E\uDDD1\u200D\uD83D\uDCBC",
};

export default function TopicsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const [selected, setSelected] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [mode, setMode] = useState<"express" | "deep">("express");

  // Load mode from sessionStorage on mount (in case returning from results)
  useEffect(() => {
    const savedMode = sessionStorage.getItem("test_mode");
    if (savedMode === "deep") setMode("deep");
  }, []);

  // Load recommendations based on job description
  useEffect(() => {
    const stored = sessionStorage.getItem("assessment_context");
    if (!stored) return;
    try {
      const ctx = JSON.parse(stored);
      if (ctx.jobDescription) {
        setLoadingRecs(true);
        fetch("/api/recommend-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription: ctx.jobDescription,
            resume: ctx.resume,
            lang,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.recommended && Array.isArray(data.recommended)) {
              setRecommended(data.recommended);
              // Auto-select recommended topics
              setSelected((prev) => {
                const merged = new Set([...prev, ...data.recommended]);
                return Array.from(merged);
              });
            }
          })
          .catch(() => {
            // Silently fail — recommendations are optional
          })
          .finally(() => setLoadingRecs(false));
      }
    } catch {
      // ignore
    }
  }, [lang]);

  const toggleTopic = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleStart = () => {
    sessionStorage.setItem("selected_topics", JSON.stringify(selected));
    sessionStorage.setItem("test_mode", mode);
    sessionStorage.setItem("test_fresh_start", "1");
    router.push("/test");
  };

  const questionsPerTopic = mode === "deep" ? 10 : 5;
  const minutesPerTopic = mode === "deep" ? 2 : 1;
  const estimatedQuestions = selected.length * questionsPerTopic;
  const estimatedMinutes = selected.length * minutesPerTopic;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-4">
          {t.topicsBadge}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.topicsTitle}
        </h1>
        <p className="text-slate-400 leading-relaxed">
          {t.topicsSubtitle}
        </p>
      </div>

      {/* AI Recommendations note */}
      {loadingRecs && (
        <div className="mb-6 px-4 py-3 bg-violet-500/5 border border-violet-500/20 rounded-xl animate-pulse">
          <p className="text-sm text-violet-300">{t.topicsLoadingRecs}</p>
        </div>
      )}

      {recommended.length > 0 && !loadingRecs && (
        <div className="mb-6 px-4 py-3 bg-violet-500/5 border border-violet-500/20 rounded-xl animate-fade-in-up">
          <p className="text-sm text-violet-300">{t.topicsRecommendedNote}</p>
        </div>
      )}

      {/* Topic grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {dimensions.map((dim) => {
          const isSelected = selected.includes(dim.key);
          const isRecommended = recommended.includes(dim.key);
          const name = lang === "en" ? dim.nameEn : dim.name;
          const desc = lang === "en" ? dim.descriptionEn : dim.description;
          const icon = TOPIC_ICONS[dim.key] || "\uD83D\uDCCA";

          return (
            <button
              key={dim.key}
              onClick={() => toggleTopic(dim.key)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 group ${
                isSelected
                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                  : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-100 text-sm leading-tight">
                      {name}
                    </span>
                    {isRecommended && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        {t.topicsRecommendedBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode selector */}
      <div className="mb-8 animate-fade-in-up">
        <h3 className="text-sm font-medium text-slate-300 mb-3">{t.modeTitle}</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("express")}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
              mode === "express"
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <span className="text-lg mr-2">&#9889;</span>
            <span className={`font-semibold text-sm ${mode === "express" ? "text-violet-300" : "text-slate-300"}`}>
              {t.modeExpress}
            </span>
            <p className="text-xs text-slate-400 mt-1">{t.modeExpressDesc}</p>
          </button>
          <button
            onClick={() => setMode("deep")}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
              mode === "deep"
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <span className="text-lg mr-2">&#128300;</span>
            <span className={`font-semibold text-sm ${mode === "deep" ? "text-violet-300" : "text-slate-300"}`}>
              {t.modeDeep}
            </span>
            <p className="text-xs text-slate-400 mt-1">{t.modeDeepDesc}</p>
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800 -mx-4 px-4 py-4 mt-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            {selected.length > 0 ? (
              <>
                <span className="text-violet-400 font-semibold">
                  {selected.length}
                </span>{" "}
                {t.topicsSelectedCount} &middot; {estimatedQuestions}{" "}
                {t.topicsQuestions} &middot; ~{estimatedMinutes}{" "}
                {t.topicsMinutes}
              </>
            ) : (
              t.topicsSelectAtLeastOne
            )}
          </div>
          <button
            onClick={handleStart}
            disabled={selected.length === 0}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-xl transition-all duration-200 ${
              selected.length > 0
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {t.topicsStartBtn}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
