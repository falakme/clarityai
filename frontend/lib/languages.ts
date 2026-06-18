/** Output languages offered by the translator's language selector. */
export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Arabic",
  "Chinese (Simplified)",
  "Hindi",
  "German",
  "Portuguese",
  "Vietnamese",
  "Tagalog",
  "Korean",
  "Urdu",
  "Bengali",
  "Russian",
  "Haitian Creole",
] as const;

export type Language = (typeof LANGUAGES)[number];
