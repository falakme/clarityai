"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** When false, the full text appears instantly (e.g. restored history). */
  enabled?: boolean;
  /** Characters per second. ~70 reads like a fast, confident typist. */
  cps?: number;
  /** Called on every reveal frame — useful for keeping a chat scrolled down. */
  onTick?: () => void;
}

/**
 * Time-based typewriter reveal. Frame-rate independent (driven by elapsed
 * time, not per-frame increments), so it types at a steady pace on any device
 * and honors `prefers-reduced-motion` by revealing instantly.
 */
export function useTypewriter(text: string, opts: Options = {}) {
  const { enabled = true, cps = 70, onTick } = opts;
  const [count, setCount] = useState(enabled ? 0 : text.length);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let raf = 0;
    let startTs = 0;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsedSec = (ts - startTs) / 1000;
      const target = Math.min(text.length, Math.ceil(elapsedSec * cps));
      setCount(target);
      onTickRef.current?.();
      if (target < text.length) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, enabled, cps]);

  return { displayed: text.slice(0, count), done: count >= text.length };
}
