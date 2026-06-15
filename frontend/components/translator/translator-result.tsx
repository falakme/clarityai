"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  ChevronDown,
  ExternalLink,
  FileSearch,
  RotateCcw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadDeadlineICS } from "@/lib/calendar";
import { useLocalStorage } from "@/lib/storage";
import type { ReliefProgram, TranslateResult } from "@/lib/types";

interface Props {
  program: ReliefProgram;
  result: TranslateResult;
  originalText: string;
  onReset: () => void;
}

export function TranslatorResult({ program, result, originalText, onReset }: Props) {
  const [showSource, setShowSource] = useState(false);

  // Build a single actionable checklist from attachments + signature steps.
  const items = useMemo(() => {
    const attach = result.required_attachments.map((label, i) => ({
      key: `doc-${i}`,
      label: `Gather: ${label}`,
    }));
    const sign = result.signature_locations.map((label, i) => ({
      key: `sign-${i}`,
      label: `Sign at: ${label}`,
    }));
    return [...attach, ...sign];
  }, [result]);

  const [checked, setChecked] = useLocalStorage<Record<string, boolean>>(
    `clearaid.checklist.${program.id}`,
    {},
  );
  const doneCount = items.filter((it) => checked[it.key]).length;


  return (
    <div className="space-y-5">
      {/* 1. The Bottom Line */}
      <Card>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          The bottom line
        </p>
        <p className="mt-2 text-3xl font-extrabold leading-tight tracking-tight">
          {result.bottom_line_summary}
        </p>
      </Card>

      {/* 2. The Deadline */}
      <Card>
        <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
          Deadline
        </p>
        {result.deadline ? (
          <>
            <p className="mt-1 text-2xl font-bold">{result.deadline}</p>
            <Button
              variant="warning"
              className="mt-4"
              onClick={() => downloadDeadlineICS(program.title, result.deadline)}
            >
              <CalendarPlus className="h-5 w-5" /> Add to calendar
            </Button>
          </>
        ) : (
          <p className="mt-1 text-xl text-muted-foreground">
            No specific deadline was found in this document. Apply as soon as you can.
          </p>
        )}
      </Card>

      {/* 3. Critical warnings (amber, never red) */}
      {result.critical_warnings.length > 0 && (
        <Card className="border-warning/40 bg-warning/10">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700">
            <AlertTriangle className="h-4 w-4" /> Important to know
          </p>
          <ul className="mt-3 space-y-2">
            {result.critical_warnings.map((w, i) => (
              <li key={i} className="text-lg text-amber-900">
                • {w}
              </li>
            ))}
          </ul>
        </Card>
      )}


      {/* 4. Action checklist */}
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Action checklist
          </p>
          {items.length > 0 && (
            <span className="text-base font-semibold text-muted-foreground">
              {doneCount}/{items.length} done
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-2 text-lg text-muted-foreground">
            No documents or signatures were detected for this form.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {items.map((it) => (
              <Checkbox
                key={it.key}
                id={it.key}
                label={it.label}
                checked={!!checked[it.key]}
                onCheckedChange={(v) => setChecked({ ...checked, [it.key]: v })}
              />
            ))}
          </div>
        )}

        {/* 5. Transparency toggle — Responsible AI guardrail */}
        <div className="mt-6 border-t border-border pt-4">
          <button
            onClick={() => setShowSource((s) => !s)}
            className="flex min-h-tap w-full items-center justify-between rounded-md text-left text-base font-semibold text-muted-foreground hover:text-foreground"
            aria-expanded={showSource}
          >
            <span className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" /> Show legal source
            </span>
            <ChevronDown
              className={"h-5 w-5 transition-transform " + (showSource ? "rotate-180" : "")}
            />
          </button>
          {showSource && (
            <div className="mt-3 space-y-3">
              <div className="rounded-md bg-primary/5 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">
                  Quote the AI relied on
                </p>
                <p className="mt-1 text-base italic">
                  &ldquo;{result.source_text_reference || "No direct quote was provided."}&rdquo;
                </p>
              </div>
              <details className="rounded-md bg-muted/60 p-4">
                <summary className="cursor-pointer text-base font-semibold">
                  View the full original text
                </summary>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {originalText}
                </pre>
              </details>
            </div>
          )}
        </div>
      </Card>


      {/* Direct action */}
      <a
        href={program.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        <ExternalLink className="h-5 w-5" /> Go to official form
      </a>

      <Button variant="ghost" className="w-full" onClick={onReset}>
        <RotateCcw className="h-5 w-5" /> Translate different text
      </Button>

      <p className="pb-4 text-center text-sm text-muted-foreground">
        ClearAid never submits this form. You review, gather your documents, and submit
        on the official site yourself.
      </p>
    </div>
  );
}
