"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "./types";

/**
 * PRIVACY SAFEGUARD: all user profile data lives ONLY in the browser's
 * localStorage. It is never sent to or stored by the backend.
 */
const PROFILE_KEY = "clearaid.profile";

export function readProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function writeProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  // Let other tabs/components react immediately.
  window.dispatchEvent(new Event("clearaid:profile"));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event("clearaid:profile"));
}

/** React hook bound to the locally-stored user profile. */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setLoaded(true);

    const sync = () => setProfile(readProfile());
    window.addEventListener("clearaid:profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("clearaid:profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: UserProfile) => {
    writeProfile(next);
    setProfile(next);
  }, []);

  const reset = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  return { profile, loaded, save, reset };
}

/**
 * Generic localStorage-backed state hook (used for checklist progress so a
 * user's checkbox ticks survive a refresh — again, never leaves the device).
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return [value, update, loaded] as const;
}
