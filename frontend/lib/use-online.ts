"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline status. Starts optimistically `true`
 * (matches the server render) and syncs on mount to avoid hydration mismatch.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
