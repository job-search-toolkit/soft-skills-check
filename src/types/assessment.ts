export type DimensionKey =
  | "critical_thinking"
  | "communication"
  | "adaptability"
  | "self_organization"
  | "product_thinking"
  | "collaboration";

export interface Question {
  id: string;
  dimension: DimensionKey;
  text: string;
  textEn: string;
  reverse: boolean;
}

export interface DimensionInfo {
  key: DimensionKey;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
}

export interface Answer {
  questionId: string;
  value: number; // 1-5
}

export interface DimensionScore {
  dimension: DimensionKey;
  name: string;
  score: number; // 1-5 average
  percentage: number; // 0-100
}

export interface AnalysisResult {
  dimensionScores: DimensionScore[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  weakDimensions: DimensionKey[];
}

export interface DeepDiveQuestion {
  id: string;
  dimension: DimensionKey;
  text: string;
  options?: string[];
}

export interface DeepDiveAnswer {
  questionId: string;
  value: number;
  dimension: DimensionKey;
}

export interface Recommendation {
  dimension: DimensionKey;
  dimensionName: string;
  score: number;
  title: string;
  description: string;
  actions: string[];
  resources: string[];
}

export interface RecommendationResult {
  summary: string;
  recommendations: Recommendation[];
  dailyHabits: string[];
  weeklyGoals: string[];
}
