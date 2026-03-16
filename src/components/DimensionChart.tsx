"use client";

import { DimensionScore } from "@/types/assessment";

interface DimensionChartProps {
  scores: DimensionScore[];
  size?: number;
}

const SHORT_NAMES: Record<string, string> = {
  critical_thinking: "Критическое\nмышление",
  communication: "Коммуникация",
  adaptability: "Адаптивность",
  self_organization: "Самоорганизация",
  product_thinking: "Продуктовое\nмышление",
  collaboration: "Коллаборация",
};

export default function DimensionChart({
  scores,
  size = 320,
}: DimensionChartProps) {
  const center = size / 2;
  const radius = size * 0.35;
  const labelRadius = size * 0.48;
  const n = scores.length;

  if (n === 0) return null;

  // Calculate positions for each axis
  const getPoint = (index: number, value: number, r: number = radius) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 5) * r;
    return {
      x: center + dist * Math.cos(angle),
      y: center + dist * Math.sin(angle),
    };
  };

  // Grid levels (1-5)
  const gridLevels = [1, 2, 3, 4, 5];

  // Data polygon points
  const dataPoints = scores.map((s, i) => getPoint(i, s.score));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="max-w-full h-auto"
      >
        {/* Grid */}
        {gridLevels.map((level) => {
          const points = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="rgb(51, 65, 85)"
              strokeWidth={level === 5 ? 1.5 : 0.5}
              opacity={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {scores.map((_, i) => {
          const p = getPoint(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgb(51, 65, 85)"
              strokeWidth={0.5}
              opacity={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="url(#radarGradient)"
          stroke="rgb(139, 92, 246)"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="rgb(139, 92, 246)"
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {scores.map((s, i) => {
          const p = getPoint(i, 5, labelRadius);
          const label = SHORT_NAMES[s.dimension] || s.name;
          const lines = label.split("\n");
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] fill-slate-400"
            >
              {lines.map((line, li) => (
                <tspan key={li} x={p.x} dy={li === 0 ? `-${(lines.length - 1) * 6}px` : "14px"}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* Score labels on points */}
        {dataPoints.map((p, i) => (
          <text
            key={`score-${i}`}
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="text-[11px] font-bold fill-violet-300"
          >
            {scores[i].score}
          </text>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
