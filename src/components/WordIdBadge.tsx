"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";

export default function WordIdBadge() {
  const { lang } = useLang();
  const isRu = lang === "ru";

  const [wordId, setWordId] = useState<string | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user_word_id");
    if (stored) setWordId(stored);
  }, []);

  // Close help on outside click
  useEffect(() => {
    if (!showHelp) return;
    const handler = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHelp]);

  const handleCopy = () => {
    if (!wordId) return;
    navigator.clipboard.writeText(wordId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = async () => {
    const id = restoreInput.trim().toLowerCase();
    if (!id) return;

    setRestoring(true);
    setRestoreError(null);

    try {
      const res = await fetch(`/api/user/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setRestoreError(isRu ? "ID не найден" : "ID not found");
        setRestoring(false);
        return;
      }

      const data = await res.json();

      sessionStorage.setItem("user_word_id", id);
      if (data.name) sessionStorage.setItem("user_name", data.name);
      if (data.email) sessionStorage.setItem("user_email", data.email);
      if (data.context) {
        sessionStorage.setItem("assessment_context", JSON.stringify(data.context));
      }
      if (data.analysisResult) {
        sessionStorage.setItem("analysisResult", JSON.stringify(data.analysisResult));
      }
      if (data.quizResults) {
        sessionStorage.setItem("quizResults", JSON.stringify(data.quizResults));
      }

      setWordId(id);
      setShowRestore(false);
      setRestoreInput("");
      window.location.reload();
    } catch {
      setRestoreError(isRu ? "Ошибка загрузки" : "Loading error");
    } finally {
      setRestoring(false);
    }
  };

  const handleClear = () => {
    sessionStorage.removeItem("user_word_id");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("invite_token");
    sessionStorage.removeItem("invite_referrer");
    setWordId(null);
  };

  // Help tooltip content
  const helpTooltip = (
    <div ref={helpRef} className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 animate-fade-in-up">
      <h4 className="text-sm font-semibold text-white mb-2">
        {isRu ? "Что такое ID?" : "What is this ID?"}
      </h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-2">
        {isRu
          ? "Это твой персональный код из 6 слов. Он позволяет сохранить результаты и открыть их с любого устройства."
          : "This is your personal 6-word code. It lets you save results and access them from any device."}
      </p>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        {isRu
          ? "ID создаётся автоматически, когда ты проходишь тест по приглашению. Если у тебя уже есть ID — введи его, чтобы восстановить данные. Или оставайся анонимом."
          : "The ID is created automatically when you take a test via invitation. If you already have an ID — enter it to restore your data. Or stay anonymous."}
      </p>
      {!wordId && (
        <button
          onClick={() => { setShowHelp(false); setShowRestore(true); }}
          className="w-full px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {isRu ? "Ввести ID" : "Enter ID"}
        </button>
      )}
    </div>
  );

  // No ID, no restore mode — show "Have ID?" + help
  if (!wordId && !showRestore) {
    return (
      <div className="relative flex items-center gap-1.5">
        <button
          onClick={() => setShowRestore(true)}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          {isRu ? "Есть ID?" : "Have ID?"}
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-[10px] font-medium flex items-center justify-center transition-colors"
        >
          ?
        </button>
        {showHelp && helpTooltip}
      </div>
    );
  }

  // Restore mode
  if (showRestore) {
    return (
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={restoreInput}
          onChange={(e) => {
            setRestoreInput(e.target.value);
            setRestoreError(null);
          }}
          placeholder="word-word-word-word-word-word"
          className="w-48 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRestore();
            if (e.key === "Escape") {
              setShowRestore(false);
              setRestoreInput("");
            }
          }}
        />
        <button
          onClick={handleRestore}
          disabled={restoring || !restoreInput.trim()}
          className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded transition-colors disabled:opacity-50"
        >
          {restoring ? "..." : "OK"}
        </button>
        <button
          onClick={() => {
            setShowRestore(false);
            setRestoreInput("");
            setRestoreError(null);
          }}
          className="text-xs text-slate-500 hover:text-slate-400"
        >
          ✕
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-[10px] font-medium flex items-center justify-center transition-colors"
        >
          ?
        </button>
        {restoreError && (
          <span className="text-xs text-red-400">{restoreError}</span>
        )}
        {showHelp && helpTooltip}
      </div>
    );
  }

  // Show word ID badge
  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={handleCopy}
        className="group flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
        title={isRu ? "Нажми чтобы скопировать" : "Click to copy"}
      >
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">ID</span>
        <span className="text-xs text-slate-500 font-mono group-hover:text-violet-400 transition-colors max-w-[120px] truncate">
          {wordId}
        </span>
        {copied && (
          <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <button
        onClick={handleClear}
        className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
        title={isRu ? "Очистить ID" : "Clear ID"}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-[10px] font-medium flex items-center justify-center transition-colors"
      >
        ?
      </button>
      {showHelp && helpTooltip}
    </div>
  );
}
