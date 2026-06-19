"use client";

import { useEffect, useState } from "react";
import {
  LANG_STORAGE_KEY,
  createTranslator,
  getStoredLanguage,
  isRTL,
  type Translator,
} from "@/lib/i18n";

/** Event name broadcast whenever the user changes the output language. */
export const LANG_CHANGE_EVENT = "clarityai:language";

/**
 * Persist the chosen language and notify every listener (same-tab via a custom
 * event, other tabs via the native `storage` event). Components built on
 * `useStoredLanguage` re-render immediately.
 */
export function persistLanguage(language: string): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
    window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: language }));
  } catch {
    /* ignore */
  }
}

/**
 * Reactive accessor for the persisted language. Lets components outside the
 * translator (offline badge, install prompt, 404 page) localize themselves and
 * stay in sync when the language changes anywhere in the app.
 */
export function useStoredLanguage(): string {
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const onChange = () => setLanguage(getStoredLanguage());
    window.addEventListener(LANG_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(LANG_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return language;
}

/** Convenience: a translator + RTL flag bound to the persisted language. */
export function useStoredTranslator(): { t: Translator; language: string; rtl: boolean } {
  const language = useStoredLanguage();
  return { t: createTranslator(language), language, rtl: isRTL(language) };
}
