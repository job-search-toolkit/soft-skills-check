"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import DimensionChart from "@/components/DimensionChart";
import { dimensionMap } from "@/lib/questions";
import { DimensionKey } from "@/types/assessment";

interface AssessmentEntry {
  date: string;
  result: {
    dimensionScores: { dimension: string; name: string; nameEn?: string; score: number; percentage: number }[];
    overallScore: number;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
}

interface QuizEntry {
  date: string;
  results: {
    answers: { questionId: string; correct: boolean }[];
    questions: { id: string; dimension: string }[];
    selectedTopics: string[];
  };
}

interface ProfileData {
  name: string | null;
  profileHash: string;
  assessmentHistory: AssessmentEntry[];
  quizHistory: QuizEntry[];
  createdAt: string;
  lastActiveAt: string;
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function QuizScoreBar({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-mono text-slate-400 w-16 text-right">{correct}/{total} ({pct}%)</span>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const hash = params.hash as string;
  const { lang } = useLang();
  const isRu = lang === "ru";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAssessmentHistory, setShowAssessmentHistory] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${hash}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [hash]);

  const latestAssessment = useMemo(() => {
    if (!profile?.assessmentHistory.length) return null;
    return profile.assessmentHistory[profile.assessmentHistory.length - 1];
  }, [profile]);

  const latestQuiz = useMemo(() => {
    if (!profile?.quizHistory.length) return null;
    return profile.quizHistory[profile.quizHistory.length - 1];
  }, [profile]);

  const quizBreakdown = useMemo(() => {
    if (!latestQuiz) return [];
    const topicScores: Record<string, { correct: number; total: number }> = {};
    for (const q of latestQuiz.results.questions) {
      if (!topicScores[q.dimension]) topicScores[q.dimension] = { correct: 0, total: 0 };
      topicScores[q.dimension].total++;
      const ans = latestQuiz.results.answers.find((a) => a.questionId === q.id);
      if (ans?.correct) topicScores[q.dimension].correct++;
    }
    return Object.entries(topicScores).map(([dim, scores]) => ({
      dimension: dim,
      name: isRu ? dimensionMap[dim as DimensionKey]?.name || dim : dimensionMap[dim as DimensionKey]?.nameEn || dim,
      ...scores,
    }));
  }, [latestQuiz, isRu]);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </div>
        <p className="text-slate-400">{isRu ? "Загружаем профиль..." : "Loading profile..."}</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">{isRu ? "Профиль не найден" : "Profile not found"}</h1>
        <p className="text-slate-400">{isRu ? "Ссылка недействительна." : "This link is invalid."}</p>
      </div>
    );
  }

  const totalQuizCorrect = latestQuiz ? latestQuiz.results.answers.filter((a) => a.correct).length : 0;
  const totalQuizQuestions = latestQuiz ? latestQuiz.results.questions.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium">
            {isRu ? "Публичный профиль" : "Public profile"}
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>{isRu ? "Скопировано!" : "Copied!"}</>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.81" />
                </svg>
                {isRu ? "Скопировать ссылку" : "Copy link"}
              </>
            )}
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {profile.name || (isRu ? "Анонимный профиль" : "Anonymous profile")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isRu ? "Последняя активность:" : "Last active:"} {formatDate(profile.lastActiveAt, lang)}
        </p>
      </div>

      {/* Self-Assessment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {isRu ? "Самооценка" : "Self-Assessment"}
          </h2>
          {profile.assessmentHistory.length > 1 && (
            <span className="text-xs text-slate-500">
              {profile.assessmentHistory.length} {isRu ? "попыток" : "attempts"}
            </span>
          )}
        </div>

        {latestAssessment ? (
          <>
            {/* Overall score */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold text-white">{latestAssessment.result.overallScore}</div>
              <div className="text-slate-500">{isRu ? "из 5" : "out of 5"}</div>
              <div className="text-xs text-slate-600 ml-auto">{formatDate(latestAssessment.date, lang)}</div>
            </div>

            {/* Radar chart */}
            <div className="mb-6">
              <DimensionChart scores={latestAssessment.result.dimensionScores} lang={lang} />
            </div>

            {/* Strengths & Weaknesses */}
            {latestAssessment.result.strengths && (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">{isRu ? "Сильные стороны" : "Strengths"}</h3>
                  <ul className="space-y-1">
                    {latestAssessment.result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">+</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                {latestAssessment.result.weaknesses && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">{isRu ? "Зоны роста" : "Growth areas"}</h3>
                    <ul className="space-y-1">
                      {latestAssessment.result.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">~</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* History toggle */}
            {profile.assessmentHistory.length > 1 && (
              <button
                onClick={() => setShowAssessmentHistory(!showAssessmentHistory)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <svg className={`w-3 h-3 transition-transform ${showAssessmentHistory ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isRu ? `Предыдущие попытки (${profile.assessmentHistory.length - 1})` : `Previous attempts (${profile.assessmentHistory.length - 1})`}
              </button>
            )}
            {showAssessmentHistory && (
              <div className="mt-3 space-y-3">
                {profile.assessmentHistory.slice(0, -1).reverse().map((entry, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{entry.result.overallScore}/5</span>
                      <span className="text-xs text-slate-500">{formatDate(entry.date, lang)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.result.dimensionScores.map((d) => (
                        <span key={d.dimension} className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                          {isRu ? d.name : d.nameEn || d.name}: {d.score}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500 text-sm">{isRu ? "Ещё не пройдена" : "Not completed yet"}</p>
        )}
      </div>

      {/* Quiz Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {isRu ? "Квиз" : "Quiz"}
          </h2>
          {profile.quizHistory.length > 1 && (
            <span className="text-xs text-slate-500">
              {profile.quizHistory.length} {isRu ? "попыток" : "attempts"}
            </span>
          )}
        </div>

        {latestQuiz ? (
          <>
            {/* Overall quiz score */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold text-white">{Math.round((totalQuizCorrect / totalQuizQuestions) * 100)}%</div>
              <div className="text-slate-500">{totalQuizCorrect}/{totalQuizQuestions} {isRu ? "правильно" : "correct"}</div>
              <div className="text-xs text-slate-600 ml-auto">{formatDate(latestQuiz.date, lang)}</div>
            </div>

            {/* Per-topic breakdown */}
            <div className="space-y-3">
              {quizBreakdown.map((topic) => (
                <div key={topic.dimension}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{topic.name}</span>
                  </div>
                  <QuizScoreBar correct={topic.correct} total={topic.total} />
                </div>
              ))}
            </div>

            {/* History toggle */}
            {profile.quizHistory.length > 1 && (
              <button
                onClick={() => setShowQuizHistory(!showQuizHistory)}
                className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <svg className={`w-3 h-3 transition-transform ${showQuizHistory ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isRu ? `Предыдущие попытки (${profile.quizHistory.length - 1})` : `Previous attempts (${profile.quizHistory.length - 1})`}
              </button>
            )}
            {showQuizHistory && (
              <div className="mt-3 space-y-3">
                {profile.quizHistory.slice(0, -1).reverse().map((entry, i) => {
                  const c = entry.results.answers.filter((a) => a.correct).length;
                  const t = entry.results.questions.length;
                  return (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm text-white">{Math.round((c / t) * 100)}% ({c}/{t})</span>
                      <span className="text-xs text-slate-500">{formatDate(entry.date, lang)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500 text-sm">{isRu ? "Ещё не пройден" : "Not completed yet"}</p>
        )}
      </div>

      {/* Homework placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {isRu ? "Домашние задания" : "Homework"}
        </h2>
        <p className="text-slate-500 text-sm">{isRu ? "Пока нет загруженных заданий" : "No homework submitted yet"}</p>
      </div>
    </div>
  );
}
