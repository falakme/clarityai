/**
 * Lightweight, fully offline i18n for ClarityAI's static UI.
 *
 * Every interface string — the intake screen AND the dashboard chrome (tab
 * names, section headers, buttons, disclaimers) — is translated client-side
 * from bundled per-language JSON dictionaries under `/locales/<code>.json`.
 * No network, no API, no latency. Changing the language instantly re-renders
 * the chrome; any missing key falls back to English.
 *
 * The LLM-generated content itself (the plain-language explanation, tasks,
 * table, and diagram) is translated server-side by passing the chosen language
 * into the gemma prompt — see backend `app/services/nvidia.py`.
 */
import en from "../locales/en.json";
import es from "../locales/es.json";
import ar from "../locales/ar.json";
import zh from "../locales/zh.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";
import pt from "../locales/pt.json";
import bn from "../locales/bn.json";
import ru from "../locales/ru.json";
import ur from "../locales/ur.json";
import vi from "../locales/vi.json";
import tl from "../locales/tl.json";
import ht from "../locales/ht.json";
import de from "../locales/de.json";
import ko from "../locales/ko.json";

/** Maps a human-readable language name to its dictionary code. */
export const LANG_CODES: Record<string, string> = {
  English: "en",
  Spanish: "es",
  Arabic: "ar",
  "Chinese (Simplified)": "zh",
  French: "fr",
  Hindi: "hi",
  German: "de",
  Portuguese: "pt",
  Bengali: "bn",
  Russian: "ru",
  Urdu: "ur",
  Vietnamese: "vi",
  Tagalog: "tl",
  Korean: "ko",
  "Haitian Creole": "ht",
};

/** Right-to-left scripts that need `dir="rtl"`. */
const RTL_CODES = new Set(["ar", "ur"]);

/** BCP-47 locales for the Web Speech API (STT), keyed by dictionary code. */
const SPEECH_LOCALES: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  ar: "ar-SA",
  zh: "zh-CN",
  fr: "fr-FR",
  hi: "hi-IN",
  de: "de-DE",
  pt: "pt-BR",
  bn: "bn-BD",
  ru: "ru-RU",
  ur: "ur-PK",
  vi: "vi-VN",
  tl: "fil-PH",
  ko: "ko-KR",
  ht: "ht-HT",
};

/** Best-effort speech-recognition locale for the chosen language. */
export function speechLocale(language: string): string {
  return SPEECH_LOCALES[langCode(language)] ?? "en-US";
}

type Dictionary = Record<string, string>;

const TABLE: Record<string, Dictionary> = {
  en,
  es,
  ar,
  zh,
  fr,
  hi,
  de,
  pt,
  bn,
  ru,
  ur,
  vi,
  tl,
  ko,
  ht,
};

const EN = TABLE.en;

/** Canonical set of translatable UI keys (derived from the English entry). */
export type UiKey = keyof typeof en;

/** Resolve a language name (or code) to a known dictionary code. */
export function langCode(language: string): string {
  if (TABLE[language]) return language; // already a code
  return LANG_CODES[language] ?? "en";
}

/** Whether a language should render right-to-left. */
export function isRTL(language: string): boolean {
  return RTL_CODES.has(langCode(language));
}

/** A bound translation function. */
export type Translator = (key: UiKey) => string;

/**
 * Build a translator bound to a language. Returns the localized string for a
 * key, falling back to English and finally to the raw key.
 */
export function createTranslator(language: string): Translator {
  const dict = TABLE[langCode(language)] ?? EN;
  return (key: UiKey) => dict[key] ?? EN[key] ?? String(key);
}
