/**
 * Deterministic social proof stats
 * Numbers are calculated from current time — consistent across page loads, no database needed.
 * Launch date: Feb 1, 2026
 */

const LAUNCH_TS = Date.UTC(2026, 1, 1); // Feb 1, 2026 00:00 UTC

export interface Stats {
  assessments: number;
  quizzes: number;
  hwCreated: number;
  hwSubmitted: number;
}

/**
 * Calculate base stats deterministically from current time.
 * Growth curve: starts at ~50/day, accelerates to ~300+/day by day 45.
 * Total at day 45 (~March 18): ~8300 assessments.
 */
export function getBaseStats(now: number = Date.now()): Stats {
  const seconds = Math.max(0, (now - LAUNCH_TS) / 1000);
  const days = seconds / 86400;

  // Quadratic growth: total = 50d + 3d²
  // Day 45: 50*45 + 3*2025 = 2250 + 6075 = 8325
  const assessments = Math.floor(50 * days + 3 * days * days);

  // Funnel ratios (realistic SaaS-like conversion)
  const quizzes = Math.floor(assessments * 0.52);
  const hwCreated = Math.floor(quizzes * 0.28);
  const hwSubmitted = Math.floor(hwCreated * 0.55);

  return { assessments, quizzes, hwCreated, hwSubmitted };
}

/**
 * Get random interval for next tick (milliseconds).
 * Assessments tick fastest, others slower proportionally.
 */
export function getTickInterval(metric: keyof Stats): number {
  const ranges: Record<keyof Stats, [number, number]> = {
    assessments: [12000, 35000],     // 12-35 seconds
    quizzes: [22000, 55000],         // 22-55 seconds
    hwCreated: [50000, 120000],      // 50-120 seconds
    hwSubmitted: [90000, 200000],    // 90-200 seconds
  };
  const [min, max] = ranges[metric];
  return min + Math.random() * (max - min);
}
