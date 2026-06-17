"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reads text aloud using the browser's Speech Synthesis API. A big
 * accessibility win for users who are stressed, low-vision, or who read more
 * comfortably than they parse dense prose. Renders nothing if the API is
 * unavailable.
 */
export function ListenButton({
  text,
  className,
  label = "Listen",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop narration if the text changes (e.g. language/ELI5 toggle).
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [text]);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={cn(
        "inline-flex min-h-tap items-center gap-2 rounded-md bg-card px-4 text-base font-bold shadow-clay-sm transition-all active:translate-y-0.5",
        speaking ? "text-primary" : "text-foreground",
        className,
      )}
    >
      {speaking ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      {speaking ? "Stop" : label}
    </button>
  );
}
