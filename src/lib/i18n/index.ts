import { ru } from "./ru";
import { en } from "./en";
import { de } from "./de";
import { es } from "./es";
import { it } from "./it";
import { kk } from "./kk";
import { uk } from "./uk";
import { zh } from "./zh";

export const ui = { de, en, es, it, kk, ru, uk, zh } as const;

export type Lang = keyof typeof ui;
export type UIStrings = typeof ru;

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
  { code: "kk", label: "KK" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UK" },
  { code: "zh", label: "ZH" },
];
