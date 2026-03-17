"use client";

import { useState, useEffect } from "react";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  dimensionName: string;
  onAnswer: (value: number) => void;
  initialValue?: number;
  scaleLabelsMap: Record<number, string>;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  dimensionName,
  onAnswer,
  initialValue,
  scaleLabelsMap,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(initialValue ?? null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setSelected(initialValue ?? null);
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, [questionNumber, initialValue]);

  const handleSelect = (value: number) => {
    setSelected(value);
    // Small delay for visual feedback before advancing
    setTimeout(() => onAnswer(value), 300);
  };

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isAnimating
          ? "opacity-0 translate-y-4"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full mb-4">
            {dimensionName}
          </span>
          <p className="text-lg md:text-xl text-slate-100 leading-relaxed">
            {questionText}
          </p>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                selected === value
                  ? "border-violet-500 bg-violet-500/10 text-violet-100"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
              }`}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  selected === value
                    ? "bg-violet-500 text-white"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {value}
              </span>
              <span className="text-sm md:text-base">{scaleLabelsMap[value]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
