/**
 * Memorable skill profile labels based on top strengths.
 * Like MBTI types but for soft skills — shareable, identity-forming.
 */

import { DimensionKey } from "@/types/assessment";

interface SkillLabel {
  id: string;
  nameRu: string;
  nameEn: string;
  descRu: string;
  descEn: string;
  emoji: string;
  requires: DimensionKey[]; // top dimensions that trigger this label
}

const LABELS: SkillLabel[] = [
  // Dual-dimension labels (most specific)
  { id: "bridge_builder", nameRu: "Мостостроитель", nameEn: "The Bridge Builder", descRu: "Соединяет людей и идеи", descEn: "Connects people and ideas", emoji: "🌉", requires: ["communication", "collaboration"] },
  { id: "navigator", nameRu: "Навигатор", nameEn: "The Navigator", descRu: "Находит путь через неизвестность", descEn: "Finds the way through uncertainty", emoji: "🧭", requires: ["adaptability", "critical_thinking"] },
  { id: "catalyst", nameRu: "Катализатор", nameEn: "The Catalyst", descRu: "Запускает изменения вокруг себя", descEn: "Ignites change around them", emoji: "⚡", requires: ["leadership", "adaptability"] },
  { id: "architect", nameRu: "Архитектор", nameEn: "The Architect", descRu: "Строит системы, которые работают", descEn: "Builds systems that work", emoji: "🏗️", requires: ["self_organization", "product_thinking"] },
  { id: "diplomat", nameRu: "Дипломат", nameEn: "The Diplomat", descRu: "Превращает конфликты в возможности", descEn: "Turns conflicts into opportunities", emoji: "🕊️", requires: ["conflict_resolution", "emotional_intelligence"] },
  { id: "captain", nameRu: "Капитан", nameEn: "The Captain", descRu: "Ведёт команду через шторм", descEn: "Leads the team through the storm", emoji: "⛵", requires: ["leadership", "conflict_resolution"] },
  { id: "empath", nameRu: "Эмпат", nameEn: "The Empath", descRu: "Чувствует то, что другие не замечают", descEn: "Senses what others miss", emoji: "💜", requires: ["emotional_intelligence", "communication"] },
  { id: "strategist", nameRu: "Стратег", nameEn: "The Strategist", descRu: "Видит дальше и планирует глубже", descEn: "Sees further and plans deeper", emoji: "♟️", requires: ["critical_thinking", "product_thinking"] },
  { id: "clockmaker", nameRu: "Часовщик", nameEn: "The Clockmaker", descRu: "Превращает хаос в порядок", descEn: "Turns chaos into order", emoji: "⏱️", requires: ["time_management", "self_organization"] },
  { id: "connector", nameRu: "Коннектор", nameEn: "The Connector", descRu: "Сила в связях между людьми", descEn: "Strength in connections between people", emoji: "🔗", requires: ["collaboration", "emotional_intelligence"] },
  { id: "pioneer", nameRu: "Первопроходец", nameEn: "The Pioneer", descRu: "Идёт первым, остальные следуют", descEn: "Goes first, others follow", emoji: "🚀", requires: ["leadership", "product_thinking"] },
  { id: "analyst", nameRu: "Аналитик", nameEn: "The Analyst", descRu: "Докопается до сути любой проблемы", descEn: "Gets to the bottom of any problem", emoji: "🔬", requires: ["critical_thinking", "self_organization"] },
  // Single-dimension fallbacks (if no dual match)
  { id: "communicator", nameRu: "Коммуникатор", nameEn: "The Communicator", descRu: "Слова — главный инструмент", descEn: "Words are the main tool", emoji: "💬", requires: ["communication"] },
  { id: "chameleon", nameRu: "Хамелеон", nameEn: "The Chameleon", descRu: "Адаптируется к любому контексту", descEn: "Adapts to any context", emoji: "🦎", requires: ["adaptability"] },
  { id: "commander", nameRu: "Командир", nameEn: "The Commander", descRu: "Решает и берёт ответственность", descEn: "Decides and takes responsibility", emoji: "🎖️", requires: ["leadership"] },
  { id: "detective", nameRu: "Детектив", nameEn: "The Detective", descRu: "Ничего не принимает на веру", descEn: "Takes nothing at face value", emoji: "🔍", requires: ["critical_thinking"] },
  { id: "maker", nameRu: "Мейкер", nameEn: "The Maker", descRu: "Думает продуктом, не задачами", descEn: "Thinks in products, not tasks", emoji: "🎯", requires: ["product_thinking"] },
  { id: "timekeeper", nameRu: "Хранитель времени", nameEn: "The Timekeeper", descRu: "Каждая минута на счету", descEn: "Every minute counts", emoji: "⌛", requires: ["time_management"] },
];

/**
 * Determine the best matching label for a user's skill profile.
 * Takes dimension scores and finds the label whose required dimensions
 * best match the user's top strengths.
 */
export function getSkillLabel(
  dimensionScores: { dimension: string; score: number }[],
  lang: "ru" | "en" | string
): { name: string; desc: string; emoji: string; id: string } {
  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);
  const topDims = sorted.slice(0, 3).map((d) => d.dimension);

  // Try dual-dimension labels first (more specific)
  for (const label of LABELS) {
    if (label.requires.length >= 2) {
      const allMatch = label.requires.every((r) => topDims.includes(r));
      if (allMatch) {
        return {
          name: lang === "ru" ? label.nameRu : label.nameEn,
          desc: lang === "ru" ? label.descRu : label.descEn,
          emoji: label.emoji,
          id: label.id,
        };
      }
    }
  }

  // Fallback to single-dimension labels
  for (const label of LABELS) {
    if (label.requires.length === 1 && topDims.includes(label.requires[0])) {
      return {
        name: lang === "ru" ? label.nameRu : label.nameEn,
        desc: lang === "ru" ? label.descRu : label.descEn,
        emoji: label.emoji,
        id: label.id,
      };
    }
  }

  // Ultimate fallback
  return {
    name: lang === "ru" ? "Универсал" : "The Generalist",
    desc: lang === "ru" ? "Сбалансированный профиль без слабых мест" : "Balanced profile with no weak spots",
    emoji: "🌟",
    id: "generalist",
  };
}

/**
 * Generate a rarity percentage for the skill profile.
 * Deterministic based on the score combination — always returns the same value for the same scores.
 */
export function getProfileRarity(dimensionScores: { dimension: string; score: number }[]): number {
  // Create a hash from scores to generate a consistent "rarity"
  let hash = 0;
  for (const d of dimensionScores) {
    hash += Math.round(d.score * 100) * (d.dimension.charCodeAt(0) + d.dimension.charCodeAt(1));
  }
  // Map to 1-8% range (always feels rare)
  return 1 + (hash % 8);
}
