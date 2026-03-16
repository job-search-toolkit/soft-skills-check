"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/lib/questions";
import { dimensionMap } from "@/lib/questions";
import { Answer } from "@/types/assessment";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";

export default function TestPage() {
  const router = useRouter();
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
    [answers, currentIndex, currentQuestion, router]
  );

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const existingAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Разминка</h1>
        <p className="text-slate-400 text-sm">
          Насколько каждая ситуация описывает тебя? Отвечай честно —
          правильных и неправильных ответов нет.
        </p>
      </div>

      <div className="mb-8">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        questionText={currentQuestion.text}
        dimensionName={dimensionMap[currentQuestion.dimension].name}
        onAnswer={handleAnswer}
        initialValue={existingAnswer?.value}
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
          Назад
        </button>

        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
    </div>
  );
}
