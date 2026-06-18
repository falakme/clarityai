"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Volume2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Reads text aloud. Prefers Microsoft Azure Cognitive Services neural TTS
 * (a premium, natural English voice) via the backend `/api/tts` proxy, and
 * gracefully falls back to the browser's built-in Speech Synthesis when Azure
 * is not configured (HTTP 503) or unreachable.
 *
 * Read-aloud is ENGLISH-ONLY by product decision: the audio always plays the
 * supplied text with an English voice.
 */
export function ListenButton({
  text,
  className,
  label = "Listen",
  stopLabel = "Stop",
}: {
  text: string;
  className?: string;
  label?: string;
  stopLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const stopWebSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopAll = useCallback(() => {
    cleanupAudio();
    stopWebSpeech();
    setSpeaking(false);
    setLoading(false);
  }, [cleanupAudio, stopWebSpeech]);

  // Stop narration when the text changes (e.g. language / ELI5 toggle) or on unmount.
  useEffect(() => {
    stopAll();
    return stopAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  /** Browser Speech Synthesis fallback (English). */
  function speakWithWebSpeech(): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.98;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
    return true;
  }

  async function start() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => stopAll();
        audio.onerror = () => stopAll();
        setLoading(false);
        setSpeaking(true);
        await audio.play();
        return;
      }
      // Azure not configured (503) or upstream error — fall back.
      setLoading(false);
      if (!speakWithWebSpeech()) setSpeaking(false);
    } catch {
      // Network/proxy failure — fall back to the browser engine.
      setLoading(false);
      if (!speakWithWebSpeech()) setSpeaking(false);
    }
  }

  function toggle() {
    if (loading) return;
    if (speaking) {
      stopAll();
      return;
    }
    void start();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      disabled={loading}
      className={cn(
        "inline-flex min-h-tap items-center gap-2 rounded-md bg-card px-4 text-base font-bold shadow-clay-sm transition-all active:translate-y-0.5 disabled:opacity-70",
        speaking ? "text-primary" : "text-foreground",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : speaking ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
      {speaking ? stopLabel : label}
    </button>
  );
}
