"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  questionLabel?: string;
  ofLabel?: string;
}

export default function ProgressBar({
  current,
  total,
  questionLabel = "Вопрос",
  ofLabel = "из",
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400">
          {questionLabel} {current} {ofLabel} {total}
        </span>
        <span className="text-sm text-slate-400">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
