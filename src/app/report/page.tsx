"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/types/assessment";
import DimensionChart from "@/components/DimensionChart";
import { dimensionMap } from "@/lib/questions";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { DimensionKey } from "@/types/assessment";

export default function ReportPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      router.push("/test");
      return;
    }
    try {
      setAnalysis(JSON.parse(stored));
    } catch {
      router.push("/test");
    }
  }, [router]);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">{t.reportNoData}</p>
      </div>
    );
  }

  const scoreColor = (score: number) =>
    score >= 4
      ? "text-green-400"
      : score >= 3
        ? "text-yellow-400"
        : "text-red-400";

  const today = new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {t.reportTitle}
        </h1>
        <p className="text-slate-500 text-sm">
          {t.reportDate}: {today}
        </p>
      </div>

      {/* Overall score — big number */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10 mb-8 animate-fade-in-up text-center">
        <p className="text-sm text-slate-400 mb-3 uppercase tracking-wide font-medium">
          {t.reportOverall}
        </p>
        <div className="inline-flex items-baseline gap-2">
          <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {analysis.overallScore}
          </span>
          <span className="text-2xl text-slate-500 font-medium">
            {t.reportOutOf}
          </span>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-6 text-center">
          {t.reportRadarTitle}
        </h2>
        <DimensionChart scores={analysis.dimensionScores} size={380} lang={lang} />
      </div>

      {/* Per-dimension bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-5">
          {t.reportDimensionsTitle}
        </h2>
        <div className="space-y-5">
          {[...analysis.dimensionScores]
            .sort((a, b) => b.score - a.score)
            .map((dim) => {
              const info = dimensionMap[dim.dimension as DimensionKey];
              const name = info
                ? lang === "en" ? info.nameEn : info.name
                : dim.name;
              return (
                <div key={dim.dimension}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300 font-medium">{name}</span>
                    <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>
                      {dim.score} / 5
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-green-400 mb-4">
            {t.reportStrengths}
          </h2>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses / growth areas */}
      {analysis.weaknesses.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-orange-400 mb-4">
            {t.reportWeaknesses}
          </h2>
          <ul className="space-y-3">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                <span className="text-orange-500 mt-0.5 flex-shrink-0 font-bold">!</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Summary */}
      {analysis.summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t.reportAiSummary}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Footer CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
        <button
          onClick={() => router.push("/quiz")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02]"
        >
          {t.reportQuizCta}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button
          onClick={() => router.push("/homework")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 border border-violet-500/30 text-violet-300 font-semibold rounded-xl transition-all duration-200 hover:bg-violet-500/10"
        >
          {t.reportHomeworkCta}
        </button>
      </div>
    </div>
  );
}
