"use client";

import { useEffect } from "react";

export type ThemeName = "default" | "emergency";

/**
 * Programmatically swaps the app's accent color scheme by toggling a
 * `data-theme` attribute on the <html> element. The CSS variables in
 * globals.css react to this attribute, re-tinting every accent surface
 * (buttons, borders, rings, focus states, glossy clay shadows) without
 * touching individual components.
 *
 * - `emergency` -> highly visible RED scheme (red-600).
 * - `default`   -> calm, trustworthy blue scheme.
 *
 * Mount this once per route. It cleans up to the default scheme on unmount so
 * navigating away from the emergency intake restores the calm palette.
 */
export function ThemeMode({ theme }: { theme: ThemeName }) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "emergency") {
      root.setAttribute("data-theme", "emergency");
    } else {
      root.removeAttribute("data-theme");
    }
    return () => {
      root.removeAttribute("data-theme");
    };
  }, [theme]);

  return null;
}
