"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Answer, AnalysisResult } from "@/types/assessment";
import DimensionChart from "@/components/DimensionChart";
import {
  calculateDimensionScores,
  calculateOverallScore,
} from "@/lib/scoring";
import { dimensionMap } from "@/lib/questions";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { DimensionKey } from "@/types/assessment";

interface BenchmarkData {
  totalCompleted: number;
  averages: Record<string, number>;
  overallAverage: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const analyticsPosted = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("testAnswers");
    if (!stored) {
      router.push("/test");
      return;
    }

    const parsedAnswers: Answer[] = JSON.parse(stored);
    setAnswers(parsedAnswers);

    // Calculate local scores first
    const dimensionScores = calculateDimensionScores(parsedAnswers);
    const overallScore = calculateOverallScore(dimensionScores);

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

    // Read current lang from localStorage (useEffect runs once)
    const currentLang = (localStorage.getItem("lang") || "ru") as "ru" | "en";
    const strings = ui[currentLang];

    // Call AI analysis
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: parsedAnswers, resume, jobDescription, lang: currentLang }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || strings.resultsAnalysisError);
        }
        return res.json();
      })
      .then((data: AnalysisResult) => {
        setAnalysis(data);
        sessionStorage.setItem("analysisResult", JSON.stringify(data));
        setLoading(false);
      })
      .catch((err) => {
        // Fallback: use local scores without AI interpretation
        const fallback: AnalysisResult = {
          dimensionScores,
          overallScore,
          strengths: [],
          weaknesses: [],
          summary: strings.resultsFallbackSummary,
          weakDimensions: dimensionScores
            .sort((a, b) => a.score - b.score)
            .slice(0, 3)
            .filter((d) => d.score < 4)
            .map((d) => d.dimension),
        };
        setAnalysis(fallback);
        sessionStorage.setItem("analysisResult", JSON.stringify(fallback));
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  // Post analytics and fetch benchmark when analysis is ready
  useEffect(() => {
    if (!analysis || analyticsPosted.current) return;
    analyticsPosted.current = true;

    // POST scores to analytics (fire-and-forget)
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dimensionScores: analysis.dimensionScores.map((d) => ({
          dimension: d.dimension,
          score: d.score,
        })),
        overallScore: analysis.overallScore,
      }),
    })
      .then(() => {
        // After posting, fetch benchmark data
        return fetch("/api/analytics");
      })
      .then((res) => {
        if (!res.ok) throw new Error("Benchmark unavailable");
        return res.json();
      })
      .then((data: BenchmarkData) => {
        setBenchmark(data);
      })
      .catch(() => {
        // Silently ignore — benchmark is optional
      });
  }, [analysis]);

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
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {t.resultsLoadingTitle}
          </h2>
          <p className="text-slate-400 text-sm">
            {t.resultsLoadingSubtitle}
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

  if (!analysis) return null;

  const scoreColor = (score: number) =>
    score >= 4
      ? "text-green-400"
      : score >= 3
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.resultsTitle}
        </h1>
        <p className="text-slate-400">
          {t.resultsSubtitle}
        </p>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 text-sm text-yellow-300">
          {error}{t.resultsErrorSuffix}
        </div>
      )}

      {/* Overall score */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {analysis.overallScore}
              </span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-white mb-2">
              {t.resultsOverallLabel} {analysis.overallScore} {t.resultsOutOf}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-6 text-center">
          {t.resultsChartTitle}
        </h2>
        <DimensionChart scores={analysis.dimensionScores} size={350} lang={lang} />
      </div>

      {/* Dimension scores list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t.resultsDetailTitle}
        </h2>
        <div className="space-y-4">
          {analysis.dimensionScores
            .sort((a, b) => b.score - a.score)
            .map((dim) => (
              <div key={dim.dimension}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-300">{lang === "en" ? (dimensionMap[dim.dimension as DimensionKey]?.nameEn || dim.name) : dim.name}</span>
                  <span className={`text-sm font-semibold ${scoreColor(dim.score)}`}>
                    {dim.score} / 5
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${dim.percentage}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {(analysis.strengths.length > 0 || analysis.weaknesses.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {analysis.strengths.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-green-400 mb-3">
                {t.resultsStrengths}
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.weaknesses.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                {t.resultsWeaknesses}
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* What's next — sell the quiz */}
      <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/20 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-3">
          {lang === "ru" ? "Это пока только самооценка" : "This is just a self-assessment so far"}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {lang === "ru"
            ? "Ты рассказал, как видишь себя. Но знаешь ли ты теорию, которая стоит за этими навыками? В квизе — реальные фреймворки, модели и кейсы. Каждый вопрос с объяснением и источником."
            : "You shared how you see yourself. But do you know the theory behind these skills? The quiz has real frameworks, models, and cases. Every question comes with an explanation and source."}
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <span className="text-2xl mb-1 block">🧠</span>
            <span className="text-xs text-slate-400">
              {lang === "ru" ? "Квиз на знания" : "Knowledge quiz"}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <span className="text-2xl mb-1 block">📊</span>
            <span className="text-xs text-slate-400">
              {lang === "ru" ? "Gap: уверенность vs знания" : "Gap: confidence vs knowledge"}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <span className="text-2xl mb-1 block">📝</span>
            <span className="text-xs text-slate-400">
              {lang === "ru" ? "Персональная домашка" : "Personal homework"}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/quiz")}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02]"
        >
          {lang === "ru" ? "Проверить знания в квизе" : "Test your knowledge in the quiz"}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Subtle exit — not a button, just a link */}
      <div className="text-center animate-fade-in-up">
        <p className="text-xs text-slate-600 mb-2">
          {lang === "ru"
            ? "Если пока не хотите продолжать — можно сохранить предварительный результат"
            : "If you don't want to continue yet — you can save your preliminary results"}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const text = [
                `Soft Skills Check — ${analysis.overallScore}/5`,
                '',
                ...analysis.dimensionScores.map(d => `${d.name}: ${d.score}/5`),
                '',
                analysis.summary,
                '',
                `https://soft-skills.chillai.space`,
              ].join('\n');
              navigator.clipboard.writeText(text).then(() => {
                const el = document.getElementById('copy-link');
                if (el) { el.textContent = lang === "ru" ? "Скопировано!" : "Copied!"; setTimeout(() => { el.textContent = lang === "ru" ? "Скопировать отчёт" : "Copy report"; }, 2000); }
              });
            }}
            id="copy-link"
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors"
          >
            {lang === "ru" ? "Скопировать отчёт" : "Copy report"}
          </button>
          <button
            onClick={() => {
              const text = `${lang === "ru" ? "Мой результат" : "My result"}: ${analysis.overallScore}/5 — https://soft-skills.chillai.space`;
              if (navigator.share) {
                navigator.share({ title: 'Soft Skills Check', text });
              } else {
                window.open(`https://t.me/share/url?url=${encodeURIComponent('https://soft-skills.chillai.space')}&text=${encodeURIComponent(text)}`, '_blank');
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors"
          >
            {lang === "ru" ? "Поделиться" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
