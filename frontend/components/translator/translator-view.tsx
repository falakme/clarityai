"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { translateForm, ApiError } from "@/lib/api";
import type { ReliefProgram, TranslateResult } from "@/lib/types";
import { TranslatorResult } from "./translator-result";
import { TranslatorSkeleton } from "./translator-skeleton";

type Phase = "input" | "loading" | "result" | "error";

export function TranslatorView({ program }: { program: ReliefProgram }) {
  const [text, setText] = useState(program.sampleFormText);
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState("");

  async function handleTranslate() {
    if (!text.trim()) return;
    setPhase("loading");
    setError("");
    try {
      const res = await translateForm(text);
      setResult(res);
      setPhase("result");
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 503
            ? "The AI service isn't configured yet. Add an NVIDIA_API_KEY to the backend."
            : `Translation failed (${e.status}). Please try again.`
          : "Something went wrong reaching the translator.";
      setError(msg);
      setPhase("error");
    }
  }


  if (phase === "loading") return <TranslatorSkeleton />;

  if (phase === "result" && result) {
    return (
      <TranslatorResult
        program={program}
        result={result}
        originalText={text}
        onReset={() => setPhase("input")}
      />
    );
  }

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Sparkles className="h-5 w-5" />
        <span className="text-lg font-semibold">Paste the relief form or terms</span>
      </div>
      <p className="mb-4 text-base text-muted-foreground">
        We&apos;ve pre-filled a sample {program.agency} document. Edit it or paste your
        own form text, then let ClearAid translate it.
      </p>

      <Textarea
        rows={12}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Form text to translate"
      />

      {phase === "error" && (
        <p className="mt-3 rounded-md bg-warning/15 p-3 text-base text-amber-800">
          {error}
        </p>
      )}

      <Button size="lg" className="mt-5 w-full" onClick={handleTranslate} disabled={!text.trim()}>
        <Wand2 className="h-5 w-5" /> Translate this for me
      </Button>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        ClearAid only explains the form. You stay in control and submit it yourself.
      </p>
    </Card>
  );
}
