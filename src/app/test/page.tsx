"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { questions as allQuestions, scaleLabels, scaleLabelsEn } from "@/lib/questions";
import { dimensionMap } from "@/lib/questions";
import { Answer } from "@/types/assessment";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

export default function TestPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const currentScaleLabels = lang === "en" ? scaleLabelsEn : scaleLabels;

  // Filter questions by selected topics
  const questions = useMemo(() => {
    if (typeof window === "undefined") return allQuestions;
    const stored = sessionStorage.getItem("selected_topics");
    if (!stored) return allQuestions;
    try {
      const selectedTopics: string[] = JSON.parse(stored);
      if (!Array.isArray(selectedTopics) || selectedTopics.length === 0)
        return allQuestions;
      return allQuestions.filter((q) => selectedTopics.includes(q.dimension));
    } catch {
      return allQuestions;
    }
  }, []);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("test_current_index");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [answers, setAnswers] = useState<Answer[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("test_answers");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Sync currentIndex to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("test_current_index", String(currentIndex));
  }, [currentIndex]);

  // Sync answers to sessionStorage
  useEffect(() => {
    if (answers.length > 0) {
      sessionStorage.setItem("test_answers", JSON.stringify(answers));
    }
  }, [answers]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(
    (value: number) => {
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
        // Clear progress keys since test is complete
        sessionStorage.removeItem("test_answers");
        sessionStorage.removeItem("test_current_index");
        router.push("/results");
      }
    },
    [answers, currentIndex, currentQuestion, questions, router]
  );

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentQuestion) return null;

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
        initialValue={existingAnswer?.value}
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
