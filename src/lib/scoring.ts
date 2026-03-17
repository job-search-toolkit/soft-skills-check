import { Answer, DimensionScore, DimensionKey } from "@/types/assessment";
import { questions, dimensionMap } from "./questions";

/**
 * Calculate score for a single answer, handling reverse-scored questions.
 * Reverse questions: agreement (5) means low skill, so we flip the scale.
 */
function getAdjustedScore(questionId: string, value: number): number {
  const question = questions.find((q) => q.id === questionId);
  if (!question) return value;
  return question.reverse ? 6 - value : value;
}

/**
 * Calculate dimension scores from raw answers.
 * Dynamically builds dimensions from the actual answered questions.
 */
export function calculateDimensionScores(
  answers: Answer[]
): DimensionScore[] {
  const dimensionAnswers: Record<string, number[]> = {};

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const adjustedScore = getAdjustedScore(answer.questionId, answer.value);
    if (!dimensionAnswers[question.dimension]) {
      dimensionAnswers[question.dimension] = [];
    }
    dimensionAnswers[question.dimension].push(adjustedScore);
  }

  const scores: DimensionScore[] = [];

  for (const [key, values] of Object.entries(dimensionAnswers)) {
    const dimKey = key as DimensionKey;
    if (values.length === 0) continue;

    const dimInfo = dimensionMap[dimKey];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const percentage = ((avg - 1) / 4) * 100;

    scores.push({
      dimension: dimKey,
      name: dimInfo ? dimInfo.name : dimKey,
      score: Math.round(avg * 10) / 10,
      percentage: Math.round(percentage),
    });
  }

  return scores;
}

/**
 * Get the overall average score.
 */
export function calculateOverallScore(dimensionScores: DimensionScore[]): number {
  if (dimensionScores.length === 0) return 0;
  const avg =
    dimensionScores.reduce((sum, d) => sum + d.score, 0) /
    dimensionScores.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Identify the weakest dimensions (bottom 2-3).
 */
export function getWeakDimensions(
  dimensionScores: DimensionScore[],
  count: number = 3
): DimensionKey[] {
  return [...dimensionScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .filter((d) => d.score < 4)
    .map((d) => d.dimension);
}

/**
 * Identify the strongest dimensions.
 */
export function getStrongDimensions(
  dimensionScores: DimensionScore[],
  count: number = 2
): DimensionKey[] {
  return [...dimensionScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .filter((d) => d.score >= 3)
    .map((d) => d.dimension);
}
