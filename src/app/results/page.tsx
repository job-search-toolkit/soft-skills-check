"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Answer, AnalysisResult } from "@/types/assessment";
import DimensionChart from "@/components/DimensionChart";
import {
  calculateDimensionScores,
  calculateOverallScore,
  generateTemplateAnalysis,
} from "@/lib/scoring";
import { dimensionMap } from "@/lib/questions";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { DimensionKey } from "@/types/assessment";
import { getSkillLabel, getProfileRarity } from "@/lib/skill-labels";
import ShareCard from "@/components/ShareCard";

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

    const currentLang = (localStorage.getItem("lang") || "ru") as "ru" | "en";
    const mode = sessionStorage.getItem("test_mode") || "express";
    const hasPersonalContext = !!(resume || jobDescription);

    // Decision: use AI only for deep test WITH resume/job context
    // Otherwise: instant template-based analysis (free, fast)
    if (mode === "deep" && hasPersonalContext) {
      // AI-powered analysis — personalized with resume/job
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: parsedAnswers, resume, jobDescription, lang: currentLang }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("AI failed");
          return res.json();
        })
        .then((data: AnalysisResult) => {
          setAnalysis(data);
          sessionStorage.setItem("analysisResult", JSON.stringify(data));
          setLoading(false);
        })
        .catch(() => {
          // Fallback to template
          const result = generateTemplateAnalysis(parsedAnswers, currentLang);
          setAnalysis(result);
          sessionStorage.setItem("analysisResult", JSON.stringify(result));
          setLoading(false);
        });
    } else {
      // Template-based analysis — free, no API call
      // Show loading for 1.2s so it feels like AI is working
      const result = generateTemplateAnalysis(parsedAnswers, currentLang);
      setTimeout(() => {
        setAnalysis(result);
        sessionStorage.setItem("analysisResult", JSON.stringify(result));
        setLoading(false);
      }, 1200);
    }
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

  // Skill label
  const skillLabel = getSkillLabel(analysis.dimensionScores, lang);
  const profileRarity = getProfileRarity(analysis.dimensionScores);
  const topDimNames = [...analysis.dimensionScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((d) => d.dimension);

  // Determine test mode
  const testMode = (typeof window !== "undefined" && sessionStorage.getItem("test_mode")) || "express";

  // Related dimension mapping
  const RELATED_DIMENSIONS: Record<string, string> = {
    conflict_resolution: "emotional_intelligence",
    leadership: "collaboration",
    communication: "product_thinking",
    adaptability: "self_organization",
    critical_thinking: "adaptability",
    time_management: "self_organization",
    self_organization: "time_management",
    product_thinking: "communication",
    collaboration: "leadership",
    emotional_intelligence: "conflict_resolution",
  };

  // Compute weak and related dimensions
  const weakDims = analysis.weakDimensions || [];
  const relatedDims = Array.from(
    new Set(
      weakDims
        .map((d) => RELATED_DIMENSIONS[d])
        .filter((d): d is string => !!d && !weakDims.includes(d))
    )
  );

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

      {/* Skill label card */}
      <div className="mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          {t.yourProfileType}
        </h2>
        <ShareCard
          label={skillLabel}
          rarity={profileRarity}
          overallScore={analysis.overallScore}
          dimensionScores={analysis.dimensionScores}
          topDimensions={topDimNames}
        />
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

      {/* Next steps — two cards side by side */}
      {testMode === "deep" ? (
        /* Deep mode — report + quiz */
        <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-fade-in-up">
          <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/20 rounded-2xl p-6 flex flex-col">
            <span className="text-2xl mb-2">📄</span>
            <h3 className="text-base font-semibold text-white mb-2">{t.resultsFullReportReady}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">{t.resultsFullReportText}</p>
            {!(typeof window !== "undefined" && (() => { try { const c = JSON.parse(sessionStorage.getItem("assessment_context") || "{}"); return c.resume || c.jobDescription; } catch { return false; } })()) && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-3">
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  {lang === "ru"
                    ? "Загрузи резюме или вакансию — тогда отчёт будет персональным с AI-анализом, а не шаблонным."
                    : "Upload a resume or job description — then the report will be personalized with AI analysis, not template-based."}
                </p>
                <button
                  onClick={() => router.push("/context")}
                  className="mt-2 text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  {lang === "ru" ? "Загрузить резюме →" : "Upload resume →"}
                </button>
              </div>
            )}
            <button
              onClick={() => router.push("/report")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              {t.resultsOpenFullReport}
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <span className="text-2xl mb-2">🧠</span>
            <h3 className="text-base font-semibold text-white mb-2">
              {lang === "ru" ? "Квиз-тренажёр" : "Quiz Trainer"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
              {lang === "ru"
                ? "Проверь знание теории: фреймворки, модели, реальные кейсы. Каждый вопрос с объяснением и источником."
                : "Test your theory knowledge: frameworks, models, real cases. Every question with explanation and source."}
            </p>
            <button
              onClick={() => router.push("/quiz")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-violet-500/30 text-violet-300 font-semibold rounded-xl transition-all duration-200 hover:bg-violet-500/10"
            >
              {t.resultsTakeQuiz}
            </button>
          </div>
        </div>
      ) : (
        /* Express mode — quiz (left) + go deeper (right) */
        <>
        <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-fade-in-up">
          {/* Quiz card — left, primary */}
          <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/20 rounded-2xl p-6 flex flex-col">
            <span className="text-2xl mb-2">🧠</span>
            <h3 className="text-base font-semibold text-white mb-2">
              {lang === "ru" ? "Квиз-тренажёр" : "Quiz Trainer"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              {lang === "ru"
                ? "Мы подготовили вопросы по твоим темам: фреймворки, модели, кейсы. Каждый ответ — с объяснением и источником."
                : "We prepared questions on your topics: frameworks, models, cases. Every answer — with explanation and source."}
            </p>
            {weakDims.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {weakDims.map((dim) => {
                  const info = dimensionMap[dim as DimensionKey];
                  const name = info ? (lang === "en" ? info.nameEn : info.name) : dim;
                  return (
                    <span key={dim} className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-auto space-y-2">
              <button
                onClick={() => router.push("/quiz")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                {lang === "ru" ? "Пройти квиз" : "Take the quiz"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem("selected_topics");
                  router.push("/quiz");
                }}
                className="w-full text-center text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                {lang === "ru" ? "или выбрать темы самому" : "or choose topics yourself"}
              </button>
            </div>
          </div>

          {/* Deep test card — right */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <span className="text-2xl mb-2">🔬</span>
            <h3 className="text-base font-semibold text-white mb-2">
              {lang === "ru" ? "Пройти глубже" : "Go deeper"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              {lang === "ru"
                ? "10 вопросов на тему с фокусом на слабых местах + смежные навыки. По итогам — подробный отчёт и рекомендации."
                : "10 questions per topic focused on weak spots + related skills. Get a detailed report and recommendations."}
            </p>
            {(weakDims.length > 0 || relatedDims.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {weakDims.map((dim) => {
                  const info = dimensionMap[dim as DimensionKey];
                  const name = info ? (lang === "en" ? info.nameEn : info.name) : dim;
                  return (
                    <span key={dim} className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/10 text-orange-300 border border-orange-500/20">
                      {name}
                    </span>
                  );
                })}
                {relatedDims.map((dim) => {
                  const info = dimensionMap[dim as DimensionKey];
                  const name = info ? (lang === "en" ? info.nameEn : info.name) : dim;
                  return (
                    <span key={dim} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-400 border border-slate-600">
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-auto">
              <button
                onClick={() => {
                  const deepTopics = [...new Set([...weakDims, ...relatedDims])];
                  sessionStorage.setItem("selected_topics", JSON.stringify(deepTopics));
                  sessionStorage.setItem("test_mode", "deep");
                  sessionStorage.setItem("test_fresh_start", "1");
                  router.push("/test");
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all duration-200 hover:bg-slate-800 hover:border-slate-600"
              >
                {t.resultsTakeDeepTest}
              </button>
            </div>
          </div>
        </div>

        </>
      )}

      {/* Subtle exit — copy/share — KEEP THIS from the old code */}
      <div className="text-center animate-fade-in-up">
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
                `https://soft-skills.transformerinstitute.org`,
              ].join('\n');
              navigator.clipboard.writeText(text).then(() => {
                const el = document.getElementById('copy-link');
                if (el) { el.textContent = lang === "ru" ? "Скопировано!" : "Copied!"; setTimeout(() => { el.textContent = lang === "ru" ? "Скопировать" : "Copy"; }, 2000); }
              });
            }}
            id="copy-link"
            className="text-xs text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
          >
            {lang === "ru" ? "Скопировать" : "Copy"}
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => {
              const text = `${analysis.overallScore}/5 — https://soft-skills.transformerinstitute.org`;
              if (navigator.share) {
                navigator.share({ title: 'Soft Skills Check', text });
              } else {
                window.open(`https://t.me/share/url?url=${encodeURIComponent('https://soft-skills.transformerinstitute.org')}&text=${encodeURIComponent(text)}`, '_blank');
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
          >
            {lang === "ru" ? "Поделиться" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
