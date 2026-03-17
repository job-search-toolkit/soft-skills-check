"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { questions as coreQuestions, scaleLabels, scaleLabelsEn } from "@/lib/questions";
import { dimensionMap } from "@/lib/questions";
import { extendedQuestions } from "@/lib/questions-pool";

// Merge core + extended pool, dedup by ID
const allQuestionsMap = new Map<string, typeof coreQuestions[0]>();
for (const q of coreQuestions) allQuestionsMap.set(q.id, q);
for (const q of extendedQuestions) { if (!allQuestionsMap.has(q.id)) allQuestionsMap.set(q.id, q); }
const allQuestions = Array.from(allQuestionsMap.values());
import { Question, Answer } from "@/types/assessment";
import QuestionCard, { QuestionRating } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

export default function TestPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const currentScaleLabels = lang === "en" ? scaleLabelsEn : scaleLabels;

  // Filter questions by selected topics (client-side only)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [ratings, setRatings] = useState<Record<string, QuestionRating>>({});

  // Load questions, restore progress — once on mount
  useEffect(() => {
    // 1. Check if this is a fresh start (from topics page) or a resume
    const freshStart = sessionStorage.getItem("test_fresh_start");
    if (freshStart) {
      sessionStorage.removeItem("test_fresh_start");
      sessionStorage.removeItem("test_answers");
      sessionStorage.removeItem("test_current_index");
      sessionStorage.removeItem("questionRatings");
    }

    // 2. Determine questions from selected topics
    let qs = allQuestions;
    const topicsStored = sessionStorage.getItem("selected_topics");
    if (topicsStored) {
      try {
        const selectedTopics: string[] = JSON.parse(topicsStored);
        if (Array.isArray(selectedTopics) && selectedTopics.length > 0) {
          const filtered = allQuestions.filter((q) => selectedTopics.includes(q.dimension));
          if (filtered.length > 0) {
            // Determine questions per topic based on mode
            const testMode = sessionStorage.getItem("test_mode");
            const perTopic = testMode === "deep" ? 10 : 5;
            // Randomize: shuffle within each topic, pick perTopic per topic
            const randomized: typeof filtered = [];
            for (const topic of selectedTopics) {
              const topicQs = filtered.filter((q) => q.dimension === topic);
              const shuffled = [...topicQs].sort(() => Math.random() - 0.5);
              randomized.push(...shuffled.slice(0, perTopic));
            }
            qs = randomized;
          }
        }
      } catch { /* ignore */ }
    }
    setQuestions(qs);

    // 3. Restore saved answers (only if not fresh start)
    if (!freshStart) {
      const savedAnswers = sessionStorage.getItem("test_answers");
      if (savedAnswers) {
        try { setAnswers(JSON.parse(savedAnswers)); } catch { /* ignore */ }
      }
      const savedIndex = sessionStorage.getItem("test_current_index");
      if (savedIndex) {
        const idx = parseInt(savedIndex, 10);
        setCurrentIndex(Math.min(idx, qs.length - 1));
      }
    }
  }, []);

  // Sync currentIndex to sessionStorage
  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem("test_current_index", String(currentIndex));
    }
  }, [currentIndex, questions.length]);

  // Sync answers to sessionStorage
  useEffect(() => {
    if (answers.length > 0) {
      sessionStorage.setItem("test_answers", JSON.stringify(answers));
    }
  }, [answers]);

  const currentQuestion = questions.length > 0 ? questions[currentIndex] : null;

  const handleAnswer = useCallback(
    (value: number) => {
      if (!currentQuestion) return;
      const newAnswers = [...answers];
      const existingIndex = newAnswers.findIndex(
        (a) => a.questionId === currentQuestion.id
      );

      if (existingIndex >= 0) {
        newAnswers[existingIndex] = {
          questionId: currentQuestion.id,
          value,
        };
      } else {
        newAnswers.push({
          questionId: currentQuestion.id,
          value,
        });
      }

      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All questions answered — save and navigate to results
        sessionStorage.setItem("testAnswers", JSON.stringify(newAnswers));
        sessionStorage.setItem("questionRatings", JSON.stringify(ratings));
        // Persist mode so results page can read it
        const currentMode = sessionStorage.getItem("test_mode") || "express";
        sessionStorage.setItem("test_mode", currentMode);
        // Fire-and-forget: send ratings to analytics
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "question_ratings", ratings }),
        }).catch(() => {});
        // Clear progress keys since test is complete
        sessionStorage.removeItem("test_answers");
        sessionStorage.removeItem("test_current_index");
        router.push("/results");
      }
    },
    [answers, currentIndex, currentQuestion, questions, router]
  );

  const handleRate = useCallback(
    (r: QuestionRating) => {
      if (!currentQuestion) return;
      setRatings((prev) => ({ ...prev, [currentQuestion.id]: r }));
    },
    [currentQuestion]
  );

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  const existingAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  );

  const questionText = lang === "en" ? currentQuestion.textEn : currentQuestion.text;
  const dimInfo = dimensionMap[currentQuestion.dimension];
  const dimensionName = dimInfo
    ? lang === "en"
      ? dimInfo.nameEn
      : dimInfo.name
    : currentQuestion.dimension;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{t.testTitle}</h1>
        <p className="text-slate-400 text-sm">
          {t.testSubtitle}
        </p>
      </div>

      <div className="mb-8">
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          questionLabel={t.progressQuestion}
          ofLabel={t.progressOf}
        />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        questionText={questionText}
        dimensionName={dimensionName}
        onAnswer={handleAnswer}
        onRate={handleRate}
        initialValue={existingAnswer?.value}
        initialRating={ratings[currentQuestion.id]}
        scaleLabelsMap={currentScaleLabels}
      />

      <div className="flex justify-between items-center mt-6 max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            currentIndex === 0
              ? "text-slate-600 cursor-not-allowed"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t.testBack}
        </button>

        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
    </div>
  );
}
