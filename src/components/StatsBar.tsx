"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "@/lib/LangContext";
import { getBaseStats, getTickInterval, type Stats } from "@/lib/stats";

const LABELS: Record<keyof Stats, Record<string, string>> = {
  assessments: {
    de: "Selbsteinschätzungen",
    en: "Self-assessments",
    es: "Autoevaluaciones",
    it: "Autovalutazioni",
    kk: "Өзін-өзі бағалау",
    ru: "Самооценок",
    uk: "Самооцінок",
    zh: "自我评估",
  },
  quizzes: {
    de: "Quiz-Tests",
    en: "Quizzes taken",
    es: "Quizzes realizados",
    it: "Quiz completati",
    kk: "Квиздер",
    ru: "Квизов пройдено",
    uk: "Квізів пройдено",
    zh: "测验完成",
  },
  hwCreated: {
    de: "Aufgaben erstellt",
    en: "Homework created",
    es: "Tareas creadas",
    it: "Compiti creati",
    kk: "Тапсырмалар",
    ru: "Заданий создано",
    uk: "Завдань створено",
    zh: "作业生成",
  },
  hwSubmitted: {
    de: "Aufgaben eingereicht",
    en: "Homework submitted",
    es: "Tareas enviadas",
    it: "Compiti consegnati",
    kk: "Тапсырылды",
    ru: "Заданий сдано",
    uk: "Завдань здано",
    zh: "作业提交",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) {
      setDisplay(value);
      return;
    }
    const prev = prevRef.current;
    prevRef.current = value;

    // Animate from prev to value
    const diff = value - prev;
    if (diff <= 0) {
      setDisplay(value);
      return;
    }

    const steps = Math.min(diff, 20);
    const stepDuration = 400 / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplay(Math.floor(prev + diff * progress));
      if (step >= steps) {
        clearInterval(interval);
        setDisplay(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export default function StatsBar() {
  const { lang } = useLang();
  const [stats, setStats] = useState<Stats>(() => getBaseStats());

  const tick = useCallback((metric: keyof Stats) => {
    setStats((prev) => ({ ...prev, [metric]: prev[metric] + 1 }));
  }, []);

  // Set up live ticking for each metric
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function scheduleTick(metric: keyof Stats) {
      const delay = getTickInterval(metric);
      const timer = setTimeout(() => {
        tick(metric);
        scheduleTick(metric); // schedule next
      }, delay);
      timers.push(timer);
    }

    // Start ticking for each metric
    (Object.keys(LABELS) as (keyof Stats)[]).forEach(scheduleTick);

    return () => timers.forEach(clearTimeout);
  }, [tick]);

  // Refresh base stats every minute (so numbers stay consistent if tab is idle)
  useEffect(() => {
    const interval = setInterval(() => {
      const base = getBaseStats();
      setStats((prev) => ({
        assessments: Math.max(prev.assessments, base.assessments),
        quizzes: Math.max(prev.quizzes, base.quizzes),
        hwCreated: Math.max(prev.hwCreated, base.hwCreated),
        hwSubmitted: Math.max(prev.hwSubmitted, base.hwSubmitted),
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const metrics: (keyof Stats)[] = ["assessments", "quizzes", "hwCreated", "hwSubmitted"];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
      {metrics.map((key) => (
        <div
          key={key}
          className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3 text-center"
        >
          <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
            <AnimatedNumber value={stats[key]} />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {LABELS[key][lang] || LABELS[key].en}
          </div>
        </div>
      ))}
    </div>
  );
}
