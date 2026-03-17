"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";
import { AnalysisResult, DimensionKey } from "@/types/assessment";
import { dimensions, dimensionMap } from "@/lib/questions";
import { quizQuestions } from "@/lib/quiz-questions";

interface HomeworkResult {
  title: string;
  description: string;
  preparation?: string[];
  steps: string[];
  reflection?: string[];
  expectedOutcome: string;
  timeEstimate: string;
  topicSuggestions?: string[];
}

type Step = "params" | "email" | "verify" | "loading" | "result";

const timeOptions = [
  { key: "15min", emoji: "\u26A1", labelRu: "15 минут — мини-задание", labelEn: "15 minutes — mini-task" },
  { key: "1hour", emoji: "\uD83D\uDD50", labelRu: "1 час — практика", labelEn: "1 hour — practice" },
  { key: "1day", emoji: "\uD83D\uDCC5", labelRu: "1 день — проект", labelEn: "1 day — project" },
  { key: "1week", emoji: "\uD83D\uDCC6", labelRu: "1 неделя — челлендж", labelEn: "1 week — challenge" },
];

const whoOptions = [
  { key: "alone", emoji: "\uD83E\uDDD8", labelRu: "Один", labelEn: "Alone" },
  { key: "team", emoji: "\uD83D\uDC65", labelRu: "С командой", labelEn: "With team" },
  { key: "family", emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", labelRu: "С семьёй / партнёром", labelEn: "With family / partner" },
  { key: "child", emoji: "\uD83D\uDC67", labelRu: "С ребёнком", labelEn: "With a child" },
  { key: "friend", emoji: "\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1", labelRu: "С другом", labelEn: "With a friend" },
];

const howOptions: Record<string, { key: string; emoji: string; labelRu: string; labelEn: string }[]> = {
  alone: [
    { key: "offline", emoji: "\uD83D\uDEB6", labelRu: "Без интернета (прогулка, дорога)", labelEn: "Offline (walk, commute)" },
    { key: "computer", emoji: "\uD83D\uDCBB", labelRu: "С компьютером", labelEn: "With a computer" },
  ],
  team: [
    { key: "inperson", emoji: "\uD83E\uDD1D", labelRu: "Вживую", labelEn: "In person" },
    { key: "online", emoji: "\uD83D\uDCF9", labelRu: "По видео", labelEn: "Video call" },
  ],
  family: [
    { key: "inperson", emoji: "\uD83E\uDD1D", labelRu: "Вживую", labelEn: "In person" },
    { key: "online", emoji: "\uD83D\uDCF9", labelRu: "По видео", labelEn: "Video call" },
  ],
  child: [
    { key: "inperson", emoji: "\uD83E\uDD1D", labelRu: "Вживую", labelEn: "In person" },
    { key: "online", emoji: "\uD83D\uDCF9", labelRu: "По видео", labelEn: "Video call" },
  ],
  friend: [
    { key: "inperson", emoji: "\uD83E\uDD1D", labelRu: "Вживую", labelEn: "In person" },
    { key: "online", emoji: "\uD83D\uDCF9", labelRu: "По видео", labelEn: "Video call" },
  ],
};

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function HomeworkPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];

  const [step, setStep] = useState<Step>("params");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [timeFormat, setTimeFormat] = useState("1hour");
  const [who, setWho] = useState("alone");
  const [how, setHow] = useState("computer");
  // Combined context string for API
  const context = who === "alone" ? `alone_${how}` : `${who}_${how}`;
  const [homework, setHomework] = useState<HomeworkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Email verification state
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [demoCodeVisible, setDemoCodeVisible] = useState(false);

  // Load analysis + quiz results
  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("analysisResult");
    if (storedAnalysis) {
      try {
        const parsed: AnalysisResult = JSON.parse(storedAnalysis);
        setAnalysis(parsed);
      } catch {
        // ignore
      }
    }

    // Get weak topics from quiz results or analysis
    const storedQuiz = sessionStorage.getItem("quizResults");
    if (storedQuiz) {
      try {
        const quizData = JSON.parse(storedQuiz);
        // Find topics with low quiz scores
        const weakFromQuiz: string[] = [];
        if (quizData.answers && quizData.questions) {
          const topicScores: Record<string, { correct: number; total: number }> = {};
          for (const q of quizData.questions) {
            if (!topicScores[q.dimension]) topicScores[q.dimension] = { correct: 0, total: 0 };
            topicScores[q.dimension].total++;
            const ans = quizData.answers.find((a: { questionId: string }) => a.questionId === q.id);
            if (ans?.correct) topicScores[q.dimension].correct++;
          }
          for (const [dim, scores] of Object.entries(topicScores)) {
            const s = scores as { correct: number; total: number };
            if (s.total > 0 && s.correct / s.total < 0.7) {
              weakFromQuiz.push(dim);
            }
          }
        }
        if (weakFromQuiz.length > 0) {
          setSelectedTopics(weakFromQuiz);
          return;
        }
      } catch {
        // ignore
      }
    }

    // Fallback to analysis weak dimensions
    if (storedAnalysis) {
      try {
        const parsed: AnalysisResult = JSON.parse(storedAnalysis);
        if (parsed.weakDimensions?.length) {
          setSelectedTopics(parsed.weakDimensions);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Available dimensions that have quiz questions
  const availableDimensions = useMemo(() => {
    const dims = Array.from(new Set(quizQuestions.map((q) => q.dimension)));
    return dimensions.filter((d) => dims.includes(d.key));
  }, []);

  const toggleTopic = (key: string) => {
    setSelectedTopics((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSendCode = () => {
    const code = generateCode();
    setVerificationCode(code);
    sessionStorage.setItem("hwVerificationCode", code);
    setDemoCodeVisible(true);
    setStep("verify");
    setCodeError(false);
    setEnteredCode(code); // Auto-fill for demo
  };

  const handleVerifyCode = () => {
    const storedCode = sessionStorage.getItem("hwVerificationCode") || verificationCode;
    if (enteredCode === storedCode) {
      setCodeError(false);
      // Store verified email
      sessionStorage.setItem("hwVerifiedEmail", email);
      generateHomework();
    } else {
      setCodeError(true);
    }
  };

  const generateHomework = async () => {
    if (selectedTopics.length === 0) return;
    setStep("loading");
    setError(null);

    // Build scores maps
    const selfAssessmentScores: Record<string, number> = {};
    if (analysis) {
      for (const d of analysis.dimensionScores) {
        selfAssessmentScores[d.dimension] = d.score;
      }
    }

    const quizScores: Record<string, number> = {};
    const storedQuiz = sessionStorage.getItem("quizResults");
    if (storedQuiz) {
      try {
        const quizData = JSON.parse(storedQuiz);
        if (quizData.answers && quizData.questions) {
          const topicScores: Record<string, { correct: number; total: number }> = {};
          for (const q of quizData.questions) {
            if (!topicScores[q.dimension]) topicScores[q.dimension] = { correct: 0, total: 0 };
            topicScores[q.dimension].total++;
            const ans = quizData.answers.find((a: { questionId: string }) => a.questionId === q.id);
            if (ans?.correct) topicScores[q.dimension].correct++;
          }
          for (const [dim, scores] of Object.entries(topicScores)) {
            const s = scores as { correct: number; total: number };
            quizScores[dim] = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          }
        }
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensions: selectedTopics,
          timeFormat,
          context,
          selfAssessmentScores,
          quizScores,
          lang,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.hwError);
      }

      const data: HomeworkResult = await res.json();
      setHomework(data);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.hwError);
      setStep("params");
    }
  };

  // Loading state
  if (step === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-6 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{t.hwGenerating}</h2>
          <p className="text-slate-400 text-sm">{t.hwGeneratingSubtitle}</p>
          <div className="flex gap-1.5 mt-6">
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-500 loading-dot" />
          </div>
        </div>
      </div>
    );
  }

  // Result step
  if (step === "result" && homework) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            {t.hwBadge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {homework.title}
          </h1>
        </div>

        {/* Homework card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
          <p className="text-slate-300 leading-relaxed mb-6">{homework.description}</p>

          {/* Topic suggestions */}
          {homework.topicSuggestions && homework.topicSuggestions.length > 0 && (
            <div className="mb-6 bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-2">
                {lang === "ru" ? "Варианты темы на выбор" : "Topic options to choose from"}
              </h3>
              <ul className="space-y-1.5">
                {homework.topicSuggestions.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-violet-400 mt-0.5">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preparation */}
          {homework.preparation && homework.preparation.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                {lang === "ru" ? "Подготовка" : "Preparation"}
              </h3>
              <div className="space-y-2">
                {homework.preparation.map((prep, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{prep}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              {t.hwSteps}
            </h3>
            <div className="space-y-3">
              {homework.steps.map((stepText, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{stepText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection */}
          {homework.reflection && homework.reflection.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {lang === "ru" ? "Рефлексия после выполнения" : "Reflection after completion"}
              </h3>
              <ul className="space-y-1.5">
                {homework.reflection.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-slate-500 mt-0.5">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expected outcome */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.hwExpectedOutcome}
            </h3>
            <p className="text-sm text-slate-300">{homework.expectedOutcome}</p>
          </div>

          {/* Time estimate */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.hwTimeEstimate}
            </h3>
            <p className="text-sm text-slate-300">{homework.timeEstimate}</p>
          </div>
        </div>

        {/* Verified email note */}
        {email && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-300">
                {t.hwEmailSuccess} ({email})
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <button
            onClick={() => {
              setHomework(null);
              setStep("params");
              setEmail("");
              setEnteredCode("");
              setVerificationCode("");
              setDemoCodeVisible(false);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {t.hwNewHomework}
          </button>
          <button
            onClick={() => router.push("/quiz")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
          >
            {t.hwBackToQuiz}
          </button>
        </div>
      </div>
    );
  }

  // Email step
  if (step === "email") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            {t.hwBadge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t.hwEmailStepTitle}
          </h1>
          <p className="text-slate-400">{t.hwEmailStepSubtitle}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-white mb-2">{t.hwSaveEmail}</h3>
          <p className="text-sm text-slate-400 mb-4">{t.hwEmailLabel}</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.hwEmailPlaceholder}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && email && email.includes("@")) {
                  handleSendCode();
                }
              }}
            />
            <button
              onClick={handleSendCode}
              disabled={!email || !email.includes("@")}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {t.hwSendCode}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t.hwEmailNote}</p>
        </div>

        <div className="flex justify-center animate-fade-in-up">
          <button
            onClick={() => setStep("params")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
          >
            {t.testBack}
          </button>
        </div>
      </div>
    );
  }

  // Verify code step
  if (step === "verify") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            {t.hwBadge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t.hwEmailStepTitle}
          </h1>
          <p className="text-slate-400">{email}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
          {/* Demo code notification */}
          {demoCodeVisible && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-300">
                  {t.hwDemoCodeNote} <span className="font-mono font-bold">{verificationCode}</span>
                </p>
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-white mb-4">{t.hwCodeLabel}</h3>

          {codeError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-300">
              {t.hwCodeError}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => {
                setEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setCodeError(false);
              }}
              placeholder={t.hwCodePlaceholder}
              maxLength={6}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono text-center text-lg tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && enteredCode.length === 6) {
                  handleVerifyCode();
                }
              }}
            />
            <button
              onClick={handleVerifyCode}
              disabled={enteredCode.length !== 6}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {t.hwVerifyCode}
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSendCode}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
            >
              {t.hwResendCode}
            </button>
            <button
              onClick={() => setStep("email")}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              {t.hwChangeEmail}
            </button>
          </div>
        </div>

        <div className="flex justify-center animate-fade-in-up">
          <button
            onClick={() => setStep("email")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
          >
            {t.testBack}
          </button>
        </div>
      </div>
    );
  }

  // Params step (default)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
          {t.hwBadge}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.hwTitle}
        </h1>
        <p className="text-slate-400">{t.hwSubtitle}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-300 animate-fade-in-up">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:text-red-200"
          >
            {t.hwRetry}
          </button>
        </div>
      )}

      {/* Topics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">{t.hwTopicsLabel}</h2>
        <p className="text-sm text-slate-400 mb-4">{t.hwTopicsNote}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableDimensions.map((dim) => {
            const isSelected = selectedTopics.includes(dim.key);
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
                <span className="text-sm font-medium">
                  {lang === "en" ? dim.nameEn : dim.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time format */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">{t.hwTimeLabel}</h2>
        <div className="space-y-2">
          {timeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeFormat(opt.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                timeFormat === opt.key
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                  timeFormat === opt.key ? "bg-violet-500/20" : "bg-slate-700"
                }`}
              >
                {opt.emoji}
              </span>
              <span className="text-sm font-medium">
                {lang === "en" ? opt.labelEn : opt.labelRu}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Who */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {lang === "ru" ? "С кем" : "With whom"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {whoOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setWho(opt.key); setHow(howOptions[opt.key]?.[0]?.key || "inperson"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                who === opt.key
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-sm font-medium">
                {lang === "en" ? opt.labelEn : opt.labelRu}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* How */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {lang === "ru" ? "Как" : "How"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(howOptions[who] || howOptions.alone).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setHow(opt.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                how === opt.key
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-sm font-medium">
                {lang === "en" ? opt.labelEn : opt.labelRu}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Continue button — goes to email step */}
      <div className="flex justify-center animate-fade-in-up">
        <button
          onClick={() => setStep("email")}
          disabled={selectedTopics.length === 0}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.hwContinue}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
