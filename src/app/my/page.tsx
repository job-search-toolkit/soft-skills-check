"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";

export default function MyProfileRedirect() {
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === "ru";
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const hash = sessionStorage.getItem("profile_hash");
    if (hash) {
      router.replace(`/p/${hash}`);
      return;
    }

    // No hash yet — maybe user has word ID but hasn't saved results yet
    const wordId = sessionStorage.getItem("user_word_id");
    if (wordId) {
      // Try to fetch user data to get profileHash
      fetch(`/api/user/${encodeURIComponent(wordId)}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.profileHash) {
            sessionStorage.setItem("profile_hash", data.profileHash);
            router.replace(`/p/${data.profileHash}`);
          } else {
            setNoProfile(true);
          }
        })
        .catch(() => setNoProfile(true));
    } else {
      setNoProfile(true);
    }
  }, [router]);

  if (!noProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">{isRu ? "Ищем ваш профиль..." : "Looking for your profile..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-white mb-2">
        {isRu ? "Профиль пока не создан" : "No profile yet"}
      </h1>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {isRu
          ? "Профиль создаётся автоматически после прохождения самооценки или квиза. Пройдите тест — и ваши результаты появятся здесь."
          : "Your profile is created automatically after completing a self-assessment or quiz. Take a test — and your results will appear here."}
      </p>
      <a
        href="/context"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
      >
        {isRu ? "Начать оценку" : "Start assessment"}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  );
}
