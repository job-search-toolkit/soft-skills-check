"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLang } from "@/lib/LangContext";

interface InviteData {
  name: string;
  email: string;
  resume?: string;
  jobDescription?: string;
  professions?: string[];
  referrerName?: string;
  wordId: string;
  lang?: "ru" | "en";
}

export default function InviteLandingPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { lang, setLang } = useLang();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not_found");
        return res.json();
      })
      .then((data: InviteData) => {
        setInvite(data);
        // Set lang from invite if provided
        if (data.lang && data.lang !== lang) {
          setLang(data.lang);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("not_found");
        setLoading(false);
      });
  }, [token, lang, setLang]);

  const handleStart = () => {
    if (!invite) return;

    // Pre-fill sessionStorage
    const context: Record<string, unknown> = {};
    if (invite.resume) context.resume = invite.resume;
    if (invite.jobDescription) context.jobDescription = invite.jobDescription;
    if (invite.professions) context.professions = invite.professions;

    if (Object.keys(context).length > 0) {
      sessionStorage.setItem("assessment_context", JSON.stringify(context));
    }

    // Store user identity
    sessionStorage.setItem("user_word_id", invite.wordId);
    sessionStorage.setItem("user_name", invite.name);
    sessionStorage.setItem("user_email", invite.email);
    if (invite.referrerName) {
      sessionStorage.setItem("invite_referrer", invite.referrerName);
    }
    sessionStorage.setItem("invite_token", token);

    // Navigate to context (pre-filled) or topics (if no resume/job)
    if (invite.resume || invite.jobDescription) {
      router.push("/context");
    } else {
      router.push("/topics");
    }
  };

  const handleCopyId = () => {
    if (!invite) return;
    navigator.clipboard.writeText(invite.wordId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRu = lang === "ru";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-slate-400">
          {isRu ? "Загружаем приглашение..." : "Loading invitation..."}
        </p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">
          {isRu ? "Приглашение не найдено" : "Invitation not found"}
        </h1>
        <p className="text-slate-400 mb-6">
          {isRu
            ? "Ссылка недействительна или срок действия истёк."
            : "This link is invalid or has expired."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
        >
          {isRu ? "На главную" : "Go to home"}
        </button>
      </div>
    );
  }

  const hasResume = !!invite.resume;
  const hasJob = !!invite.jobDescription;
  const hasProfessions = invite.professions && invite.professions.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-4">
          {isRu ? "Персональное приглашение" : "Personal invitation"}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {isRu
            ? `${invite.name}, добро пожаловать!`
            : `Welcome, ${invite.name}!`}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          {invite.referrerName
            ? isRu
              ? `${invite.referrerName} подготовил${invite.referrerName.endsWith("а") ? "а" : ""} для тебя оценку soft skills.`
              : `${invite.referrerName} prepared a soft skills assessment for you.`
            : isRu
              ? "Для тебя подготовлена персональная оценка soft skills."
              : "A personal soft skills assessment has been prepared for you."}
        </p>
      </div>

      {/* What's included */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {isRu ? "Что подготовлено" : "What's prepared"}
        </h2>
        <div className="space-y-3">
          {hasResume && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300">
                {isRu ? "Резюме загружено" : "Resume uploaded"}
              </span>
            </div>
          )}
          {hasJob && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300">
                {isRu ? "Описание вакансии добавлено" : "Job description added"}
              </span>
            </div>
          )}
          {hasProfessions && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300">
                {isRu ? "Сфера деятельности выбрана" : "Professional field selected"}
              </span>
            </div>
          )}
          {!hasResume && !hasJob && !hasProfessions && (
            <p className="text-sm text-slate-400">
              {isRu
                ? "Ты сможешь добавить резюме и контекст на следующем шаге."
                : "You can add your resume and context on the next step."}
            </p>
          )}
        </div>
      </div>

      {/* Referrer badge */}
      {invite.referrerName && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">
                {isRu
                  ? `Оплачено: ${invite.referrerName}`
                  : `Provided by ${invite.referrerName}`}
              </p>
              <p className="text-xs text-slate-500">
                {isRu
                  ? "Полный доступ ко всем функциям"
                  : "Full access to all features"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Word ID */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-fade-in-up">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {isRu ? "Твой персональный ID" : "Your personal ID"}
        </h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-violet-300 font-mono text-sm break-all">
            {invite.wordId}
          </code>
          <button
            onClick={handleCopyId}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0"
            title={isRu ? "Скопировать" : "Copy"}
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {isRu
            ? "Сохрани этот ID — с ним ты сможешь открыть свои результаты с любого устройства."
            : "Save this ID — you can use it to access your results from any device."}
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-center animate-fade-in-up">
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105"
        >
          {isRu ? "Начать оценку" : "Start assessment"}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
