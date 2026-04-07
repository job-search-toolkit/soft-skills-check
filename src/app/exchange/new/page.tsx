"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../../lib/LangContext";
import { ui } from "../../../lib/i18n";
import { dimensions } from "../../../lib/questions";
import { quizQuestions } from "../../../lib/quiz-questions";

export default function NewExchangePage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];

  const [strongTopics, setStrongTopics] = useState<string[]>([]);
  const [wantTopics, setWantTopics] = useState<string[]>([]);
  const [format, setFormat] = useState<"text" | "video" | "any">("any");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available dimensions (those with quiz questions)
  const availableDimensions = useMemo(() => {
    const dims = Array.from(new Set(quizQuestions.map((q) => q.dimension)));
    return dimensions.filter((d) => dims.includes(d.key));
  }, []);

  // Pre-fill from assessment
  useEffect(() => {
    const analysisRaw = sessionStorage.getItem("analysisResult");
    if (analysisRaw) {
      try {
        const analysis = JSON.parse(analysisRaw);
        if (analysis.dimensionScores) {
          const sorted = [...analysis.dimensionScores].sort(
            (a: { score: number }, b: { score: number }) => b.score - a.score
          );
          setStrongTopics(sorted.slice(0, 3).map((d: { dimension: string }) => d.dimension));
          setWantTopics(sorted.slice(-3).map((d: { dimension: string }) => d.dimension));
        }
      } catch {
        /* ignore */
      }
    }
    const storedEmail = sessionStorage.getItem("user_email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const toggleStrong = (key: string) => {
    setStrongTopics((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const toggleWant = (key: string) => {
    setWantTopics((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    const wordId = sessionStorage.getItem("user_word_id");
    if (!wordId) {
      setError(lang === "ru" ? "Нужен Word ID. Пройдите тест сначала." : "Word ID required. Complete a test first.");
      return;
    }
    if (!strongTopics.length || !wantTopics.length) {
      setError(lang === "ru" ? "Выберите хотя бы по одной теме" : "Select at least one topic in each category");
      return;
    }
    if (!email || !email.includes("@")) {
      setError(lang === "ru" ? "Укажите email" : "Email required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId,
          strongTopics,
          wantTopics,
          format,
          message: message.trim(),
          contactEmail: email.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/exchange"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">{t.exchangeSuccess}</h1>
        <p className="text-slate-400 text-sm">
          {lang === "ru" ? "Переходим к доске обмена..." : "Redirecting to exchange board..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-4">
          {t.exchangeTitle}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.exchangeNewTitle}
        </h1>
        <p className="text-slate-400">{t.exchangeNewSubtitle}</p>
      </div>

      {/* Strong topics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">{t.exchangeStrongLabel}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableDimensions.map((dim) => {
            const isSelected = strongTopics.includes(dim.key);
            return (
              <button
                key={dim.key}
                onClick={() => toggleStrong(dim.key)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-green-500/50 bg-green-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-green-500 bg-green-500" : "border-slate-600"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{lang === "en" ? dim.nameEn : dim.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Want topics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">{t.exchangeWantLabel}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableDimensions.map((dim) => {
            const isSelected = wantTopics.includes(dim.key);
            return (
              <button
                key={dim.key}
                onClick={() => toggleWant(dim.key)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-orange-500/50 bg-orange-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-orange-500 bg-orange-500" : "border-slate-600"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{lang === "en" ? dim.nameEn : dim.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">{t.exchangeFormatLabel}</h2>
        <div className="flex flex-wrap gap-2">
          {(["text", "video", "any"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                format === f
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <span className="text-lg">{f === "text" ? "💬" : f === "video" ? "📹" : "🤝"}</span>
              <span className="text-sm font-medium">
                {f === "text" ? t.exchangeFormatText : f === "video" ? t.exchangeFormatVideo : t.exchangeFormatAny}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">{t.exchangeMessageLabel}</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.exchangeMessagePlaceholder}
          maxLength={500}
          className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-y transition-colors"
        />
      </div>

      {/* Email */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">{t.exchangeEmailLabel}</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
        />
        <p className="text-xs text-slate-500 mt-2">{t.exchangeEmailNote}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-center animate-fade-in-up">
        <button
          onClick={handleSubmit}
          disabled={submitting || !strongTopics.length || !wantTopics.length || !email}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "..." : t.exchangeSubmit}
        </button>
      </div>
    </div>
  );
}
