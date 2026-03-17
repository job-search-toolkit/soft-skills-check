"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult, DeepDiveAnswer, RecommendationResult } from "@/types/assessment";
import RecommendationCard from "@/components/RecommendationCard";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

export default function RecommendationsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analysisStored = sessionStorage.getItem("analysisResult");
    if (!analysisStored) {
      router.push("/test");
      return;
    }

    const analysis: AnalysisResult = JSON.parse(analysisStored);
    const deepDiveStored = sessionStorage.getItem("deepDiveAnswers");
    const deepDiveAnswers: DeepDiveAnswer[] = deepDiveStored
      ? JSON.parse(deepDiveStored)
      : [];

    // Read optional context
    let resume: string | undefined;
    let jobDescription: string | undefined;
    const contextStored = sessionStorage.getItem("assessment_context");
    if (contextStored) {
      try {
        const ctx = JSON.parse(contextStored);
        resume = ctx.resume;
        jobDescription = ctx.jobDescription;
      } catch {
        // ignore
      }
    }

    // Read current lang from localStorage
    const currentLang = localStorage.getItem("lang") || "ru";

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis,
        deepDiveAnswers,
        resume,
        jobDescription,
        lang: currentLang,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error generating recommendations");
        }
        return res.json();
      })
      .then((data: RecommendationResult) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-6 animate-pulse-slow">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {t.recsLoadingTitle}
          </h2>
          <p className="text-slate-400 text-sm">
            {t.recsLoadingSubtitle}
          </p>
          <div className="flex gap-1.5 mt-6">
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-400 mb-2">{t.recsError}</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-sm"
            >
              {t.recsRetry}
            </button>
            <button
              onClick={() => router.push("/results")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm"
            >
              {t.recsBackToResults}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.recsTitle}
        </h1>
        <p className="text-slate-400">{result.summary}</p>
      </div>

      {/* Recommendations per dimension */}
      <div className="space-y-6 mb-8">
        {result.recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.dimension}
            recommendation={rec}
            index={i}
            actionStepsLabel={t.recsActionSteps}
            resourcesLabel={t.recsResources}
          />
        ))}
      </div>

      {/* Daily habits */}
      {result.dailyHabits.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-violet-400 mb-4">
            {t.recsDailyHabits}
          </h2>
          <ul className="space-y-3">
            {result.dailyHabits.map((habit, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-xs font-medium mt-0.5">
                  {i + 1}
                </span>
                {habit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weekly goals */}
      {result.weeklyGoals.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-indigo-400 mb-4">
            {t.recsWeeklyGoals}
          </h2>
          <ul className="space-y-3">
            {result.weeklyGoals.map((goal, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-medium mt-0.5">
                  {i + 1}
                </span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
        <button
          onClick={() => {
            sessionStorage.clear();
            router.push("/");
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
        >
          {t.recsStartOver}
        </button>
        <button
          onClick={() => router.push("/results")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
        >
          {t.recsBackBtn}
        </button>
      </div>
    </div>
  );
}
