"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { AnalysisResult, DimensionKey } from "@/types/assessment";
import { dimensions, dimensionMap } from "@/lib/questions";
import { quizQuestions, getRandomQuizQuestions, QuizQuestion } from "@/lib/quiz-questions";
import ProgressBar from "@/components/ProgressBar";

type QuizAnswer = {
  questionId: string;
  selectedKey: string;
  correct: boolean;
};

export default function QuizPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopicPicker, setShowTopicPicker] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizRatings, setQuizRatings] = useState<Record<string, string>>({});

  // Load analysis from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      try {
        const parsed: AnalysisResult = JSON.parse(stored);
        setAnalysis(parsed);
        // Pre-select weak dimensions
        if (parsed.weakDimensions && parsed.weakDimensions.length > 0) {
          setSelectedTopics(parsed.weakDimensions);
        } else {
          // If no weak dimensions, select all
          const allDims = parsed.dimensionScores.map((d) => d.dimension);
          setSelectedTopics(allDims);
        }
      } catch {
        // If no analysis, select all available quiz dimensions
        const available = Array.from(new Set(quizQuestions.map((q) => q.dimension)));
        setSelectedTopics(available);
      }
    } else {
      const available = Array.from(new Set(quizQuestions.map((q) => q.dimension)));
      setSelectedTopics(available);
    }
  }, []);

  // Available dimensions (that have quiz questions)
  const availableDimensions = useMemo(() => {
    const dims = Array.from(new Set(quizQuestions.map((q) => q.dimension)));
    return dimensions.filter((d) => dims.includes(d.key));
  }, []);

  const toggleTopic = (key: string) => {
    setSelectedTopics((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const startQuiz = () => {
    if (selectedTopics.length === 0) return;
    const qs = getRandomQuizQuestions(selectedTopics, 3);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizFinished(false);
    setShowTopicPicker(false);
  };

  const handleOptionSelect = (key: string) => {
    if (showExplanation) return; // Already answered
    setSelectedOption(key);
    setShowExplanation(true);

    const currentQ = questions[currentIndex];
    const isCorrect = key === currentQ.correctAnswer;
    setAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, selectedKey: key, correct: isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Save quiz results to sessionStorage
      const quizResults = {
        answers,
        questions: questions.map((q) => ({
          id: q.id,
          dimension: q.dimension,
        })),
        selectedTopics,
      };
      sessionStorage.setItem("quizResults", JSON.stringify(quizResults));
      // Send quiz ratings to analytics
      if (Object.keys(quizRatings).length > 0) {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "quiz_ratings", ratings: quizRatings }),
        }).catch(() => {});
      }
      setQuizFinished(true);
    }
  };

  // Calculate results
  const totalCorrect = answers.filter((a) => a.correct).length;
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Per-topic breakdown
  const topicBreakdown = useMemo(() => {
    if (!quizFinished) return [];
    const breakdown: { dimension: string; correct: number; total: number }[] = [];
    for (const topic of selectedTopics) {
      const topicQs = questions.filter((q) => q.dimension === topic);
      const topicAnswers = answers.filter((a) =>
        topicQs.some((q) => q.id === a.questionId)
      );
      const correct = topicAnswers.filter((a) => a.correct).length;
      breakdown.push({ dimension: topic, correct, total: topicQs.length });
    }
    return breakdown;
  }, [quizFinished, selectedTopics, questions, answers]);

  // Gap analysis: compare self-assessment vs quiz
  const gapAnalysis = useMemo(() => {
    if (!quizFinished || !analysis) return [];
    return topicBreakdown.map((tb) => {
      const selfScore = analysis.dimensionScores.find(
        (d) => d.dimension === tb.dimension
      );
      const quizPct = tb.total > 0 ? Math.round((tb.correct / tb.total) * 100) : 0;
      const dimInfo = dimensionMap[tb.dimension as DimensionKey];
      return {
        dimension: tb.dimension,
        name: lang === "en" ? dimInfo?.nameEn || tb.dimension : dimInfo?.name || tb.dimension,
        selfScore: selfScore?.score || 0,
        selfPct: selfScore?.percentage || 0,
        quizPct,
      };
    });
  }, [quizFinished, analysis, topicBreakdown, lang]);

  // Topic picker screen
  if (showTopicPicker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            {t.quizBadge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t.quizTitle}
          </h1>
          <p className="text-slate-400">{t.quizSubtitle}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-2">
            {t.quizTopicToggle}
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            {t.quizTopicToggleNote}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableDimensions.map((dim) => {
              const isSelected = selectedTopics.includes(dim.key);
              const isWeak = analysis?.weakDimensions?.includes(dim.key);
              return (
                <button
                  key={dim.key}
                  onClick={() => toggleTopic(dim.key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-violet-500/50 bg-violet-500/10 text-white"
                      : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "border-violet-500 bg-violet-500"
                        : "border-slate-600"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {lang === "en" ? dim.nameEn : dim.name}
                    </div>
                  </div>
                  {isWeak && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex-shrink-0">
                      {lang === "en" ? "Growth area" : "Зона роста"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTopics.length === 0 && (
          <p className="text-center text-orange-400 text-sm mb-4">
            {t.quizSelectTopics}
          </p>
        )}

        <div className="flex justify-center animate-fade-in-up">
          <button
            onClick={startQuiz}
            disabled={selectedTopics.length === 0}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.topicsStartBtn}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Quiz finished — show results
  if (quizFinished) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t.quizResultTitle}
          </h1>
        </div>

        {/* Score card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
                percentage >= 70
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : percentage >= 40
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                    : "bg-gradient-to-br from-red-500 to-rose-600"
              }`}
            >
              <span className="text-3xl font-bold text-white">{percentage}%</span>
            </div>
            <p className="text-lg text-slate-300">
              {totalCorrect} {t.quizResultScore} {t.quizResultOf} {totalQuestions}
            </p>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t.quizTopicBreakdown}
          </h2>
          <div className="space-y-3">
            {topicBreakdown.map((tb) => {
              const dimInfo = dimensionMap[tb.dimension as DimensionKey];
              const pct = tb.total > 0 ? Math.round((tb.correct / tb.total) * 100) : 0;
              return (
                <div key={tb.dimension}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-300">
                      {lang === "en" ? dimInfo?.nameEn || tb.dimension : dimInfo?.name || tb.dimension}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400"
                      }`}
                    >
                      {tb.correct}/{tb.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        pct >= 70
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : pct >= 40
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-red-500 to-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap analysis */}
        {gapAnalysis.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-4">
              {t.quizGapAnalysis}
            </h2>
            <div className="space-y-4">
              {gapAnalysis.map((ga) => (
                <div key={ga.dimension} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm font-medium text-white mb-3">{ga.name}</div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">{t.quizSelfAssessment}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${ga.selfPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-violet-400 w-12 text-right">
                          {ga.selfScore}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">{t.quizKnowledge}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ga.quizPct >= 70 ? "bg-green-500" : ga.quizPct >= 40 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${ga.quizPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-12 text-right">{ga.quizPct}%</span>
                      </div>
                    </div>
                  </div>
                  {ga.selfPct > ga.quizPct + 10 && (
                    <p className="text-xs text-orange-400 mt-1">
                      {ga.name}: {t.quizSelfAssessment.toLowerCase()} {ga.selfScore}/5, {t.quizKnowledge.toLowerCase()} {ga.quizPct}% — {t.quizGapNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <button
            onClick={() => router.push("/homework")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {t.quizGetHomework}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/results")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
          >
            {t.quizBackToResults}
          </button>
        </div>
      </div>
    );
  }

  // Active quiz — show question
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const questionText = lang === "en" ? currentQ.textEn : currentQ.text;
  const dimInfo = dimensionMap[currentQ.dimension as DimensionKey];
  const dimensionName = dimInfo
    ? lang === "en"
      ? dimInfo.nameEn
      : dimInfo.name
    : currentQ.dimension;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{t.quizTitle}</h1>
        <p className="text-slate-400 text-sm">{t.quizSubtitle}</p>
      </div>

      <div className="mb-8">
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          questionLabel={t.progressQuestion}
          ofLabel={t.progressOf}
        />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Dimension badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
            {dimensionName}
          </span>
        </div>

        {/* Question */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <p className="text-lg text-white leading-relaxed">{questionText}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCorrectAnswer = opt.key === currentQ.correctAnswer;
            const optText = lang === "en" ? opt.textEn : opt.text;

            let borderClass = "border-slate-700 hover:border-slate-600";
            let bgClass = "bg-slate-800/50";

            if (showExplanation) {
              if (isCorrectAnswer) {
                borderClass = "border-green-500/50";
                bgClass = "bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
              } else if (isSelected && !isCorrectAnswer) {
                borderClass = "border-red-500/50";
                bgClass = "bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
              }
            } else if (isSelected) {
              borderClass = "border-violet-500/50";
              bgClass = "bg-violet-500/10";
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleOptionSelect(opt.key)}
                disabled={showExplanation}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${borderClass} ${bgClass} ${
                  showExplanation ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    showExplanation && isCorrectAnswer
                      ? "bg-green-500 text-white"
                      : showExplanation && isSelected && !isCorrectAnswer
                        ? "bg-red-500 text-white"
                        : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {showExplanation && isCorrectAnswer ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : showExplanation && isSelected && !isCorrectAnswer ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    opt.key.toUpperCase()
                  )}
                </span>
                <span className="text-sm text-slate-200 leading-relaxed pt-0.5">
                  {optText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation card */}
        {showExplanation && (
          <div className="animate-fade-in-up mb-6">
            <div
              className={`rounded-2xl border p-5 ${
                selectedOption === currentQ.correctAnswer
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-sm font-semibold ${
                    selectedOption === currentQ.correctAnswer ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {selectedOption === currentQ.correctAnswer ? t.quizCorrect : t.quizWrong}
                </span>
              </div>
              <div className="mb-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {t.quizExplanation}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {lang === "en" ? currentQ.explanationEn : currentQ.explanation}
                </p>
              </div>
              {currentQ.source && (
                <div className="pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-400">{t.quizSource}: </span>
                  {currentQ.sourceUrl ? (
                    <a
                      href={currentQ.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2"
                    >
                      {currentQ.source} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-violet-400">{currentQ.source}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question quality rating */}
        {showExplanation && (
          <div className="mb-4 animate-fade-in-up">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-600 mr-1">{lang === "ru" ? "Вопрос:" : "Question:"}</span>
              {[
                { key: "clear", emoji: "👍", label: lang === "ru" ? "Понятно" : "Clear" },
                { key: "fair", emoji: "✅", label: lang === "ru" ? "Честный" : "Fair" },
                { key: "okay", emoji: "😐", label: lang === "ru" ? "Так себе" : "So-so" },
                { key: "ambiguous", emoji: "❓", label: lang === "ru" ? "Неоднозначный" : "Ambiguous" },
              ].map((opt) => {
                const isSelected = quizRatings[currentQ.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setQuizRatings((prev) => ({ ...prev, [currentQ.id]: opt.key }))}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all duration-150 border ${
                      isSelected
                        ? opt.key === "clear" || opt.key === "fair"
                          ? "border-green-500/40 bg-green-500/10 text-green-400"
                          : opt.key === "okay"
                            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                        : "border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-500"
                    }`}
                  >
                    <span className="text-xs">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Next button */}
        {showExplanation && (
          <div className="flex justify-center animate-fade-in-up">
            <button
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              {currentIndex < questions.length - 1 ? t.quizNext : t.quizFinish}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between items-center mt-6 max-w-2xl mx-auto">
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
    </div>
  );
}
