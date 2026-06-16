"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { phaseFade } from "@/lib/motion";
import { translateForm, ApiError } from "@/lib/api";
import type { TranslateResult } from "@/lib/types";
import { FileIntake } from "./file-intake";
import { TranslatorResult } from "./translator-result";
import { TranslatorSkeleton } from "./translator-skeleton";

type Phase = "input" | "loading" | "result" | "error";

interface Props {
  /** Selects the backend prompt: "emergency" or "general". */
  docType: "emergency" | "general";
  /** Stable key for persisting checklist progress per surface. */
  storageKey: string;
  /** Headline prompt. */
  title?: string;
  /** Sub-headline beneath the prompt. */
  subtitle?: string;
  /** Tailwind accent applied to the prompt heading. */
  accentClassName?: string;
}

/**
 * Single, unified document-intake surface used by BOTH the emergency intake
 * (`/emergency`) and the everyday dashboard (`/dashboard`). Replaces the old
 * per-program preset cards.
 *
 * Controls:
 *  - a free-text area for typing what the user needs help with (custom
 *    context), or pasting a letter/bill,
 *  - a drag-and-drop zone for PDFs / images,
 *  - a native camera button for snapping a document on mobile.
 *
 * Both the typed context AND the uploaded document are sent to the backend
 * together (see lib/api.ts -> backend translate-form -> NVIDIA gemma-3n-e4b-it).
 */
export function IntakeWorkspace({
  docType,
  storageKey,
  title = "What do you need help with today?",
  subtitle = "Describe your situation in your own words, paste a letter or bill, or add a photo or PDF of a document. ClearAid reads it and explains it in plain language.",
  accentClassName = "text-primary",
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState("");

  const canSubmit = !!file || text.trim().length > 0;

  async function handleTranslate() {
    if (!canSubmit) return;
    setPhase("loading");
    setError("");
    try {
      // Send BOTH the user's typed context and the uploaded document.
      const res = await translateForm({ text, file, docType });
      setResult(res);
      setPhase("result");
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 503
            ? "The AI service isn't configured yet. Add an NVIDIA_API_KEY to the backend."
            : e.status === 502
              ? "ClearAid had trouble reading that. Please try again."
              : e.status === 422 || e.status === 413
                ? e.message
                : `Translation failed (${e.status}). Please try again.`
          : "Something went wrong reaching the translator.";
      setError(msg);
      setPhase("error");
    }
  }

  const originalText = file
    ? `${text ? text + "\n\n" : ""}Uploaded document: ${file.name}`
    : text;

  const motionProps = {
    variants: phaseFade,
    initial: "hidden" as const,
    animate: "show" as const,
    exit: "exit" as const,
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "loading" ? (
        <motion.div key="loading" {...motionProps}>
          <TranslatorSkeleton />
        </motion.div>
      ) : phase === "result" && result ? (
        <motion.div key="result" {...motionProps}>
          <TranslatorResult
            result={result}
            originalText={originalText}
            storageKey={storageKey}
            onReset={() => {
              setFile(null);
              setText("");
              setPhase("input");
            }}
          />
        </motion.div>
      ) : (
        <motion.div key="input" {...motionProps}>
          <Card>
            <h2 className={"text-2xl font-extrabold tracking-tight sm:text-3xl " + accentClassName}>
              {title}
            </h2>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">{subtitle}</p>

            <div className="mt-6">
              <Textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type what you need help with — for example: 'I got this letter and I don't understand the deadline.' Or paste the text of a notice, bill, or form here…"
                aria-label="Describe what you need help with"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Paperclip className="h-4 w-4" /> ADD A DOCUMENT (OPTIONAL)
              </div>
              <FileIntake file={file} onFile={setFile} />
            </div>

            <AnimatePresence>
              {phase === "error" && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden rounded-md bg-warning/15 p-3 text-base text-amber-800"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleTranslate}
              disabled={!canSubmit}
            >
              <Wand2 className="h-5 w-5" /> Explain this for me
            </Button>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              ClearAid only explains and organizes. You stay in control and submit
              anything yourself.
            </p>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
