"use client";

import { Recommendation } from "@/types/assessment";

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  actionStepsLabel?: string;
  resourcesLabel?: string;
}

export default function RecommendationCard({
  recommendation,
  index,
  actionStepsLabel = "Конкретные шаги:",
  resourcesLabel = "Полезные ресурсы:",
}: RecommendationCardProps) {
  const scoreColor =
    recommendation.score >= 4
      ? "text-green-400"
      : recommendation.score >= 3
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-1">
            {recommendation.title}
          </h3>
          <span className="text-sm text-slate-400">
            {recommendation.dimensionName}
          </span>
        </div>
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {recommendation.score}/5
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
        {recommendation.description}
      </p>

      {recommendation.actions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-violet-400 mb-2">
            {actionStepsLabel}
          </h4>
          <ul className="space-y-1.5">
            {recommendation.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-violet-500 mt-0.5 flex-shrink-0">&#9656;</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation.resources.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-indigo-400 mb-2">
            {resourcesLabel}
          </h4>
          <ul className="space-y-1.5">
            {recommendation.resources.map((resource, i) => (
              <li key={i} className="text-sm text-slate-400">
                {resource}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
