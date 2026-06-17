"use client";

import { useMemo } from "react";
import { Baby, BookOpenText, Languages, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { ListenButton } from "@/components/listen-button";
import { Item, Stagger } from "@/components/motion";
import { LANGUAGES } from "@/lib/languages";
import { markdownToPlainText } from "@/lib/text";
import type { TranslateResult } from "@/lib/types";
import { DataTable } from "../data-table";
import { ConfidenceBadge, UrgencyBanner } from "./shared";

/**
 * Tab 1 — Summary.
 * ELI5 / output-language controls, the urgency banner, the plain-language
 * explanation (with read-aloud), and the optional breakdown table. Changing a
 * control re-translates in place; `refreshing` shows that without leaving the
 * tab.
 */
export function SummaryTab({
  result,
  eli5,
  language,
  onEli5Change,
  onLanguageChange,
  refreshing,
}: {
  result: TranslateResult;
  eli5: boolean;
  language: string;
  onEli5Change: (next: boolean) => void;
  onLanguageChange: (next: string) => void;
  refreshing: boolean;
}) {
  const spoken = useMemo(
    () =>
      [result.plain_language_brief, markdownToPlainText(result.plain_language_explanation_markdown)]
        .filter(Boolean)
        .join(". "),
    [result.plain_language_brief, result.plain_language_explanation_markdown],
  );

  return (
    <Stagger className="space-y-5">
      {/* Controls */}
      <Item>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onEli5Change(!eli5)}
            aria-pressed={eli5}
            disabled={refreshing}
            className={
              "flex min-h-tap items-center gap-2 rounded-md px-4 text-base font-bold shadow-clay-sm transition-all disabled:opacity-60 " +
              (eli5 ? "bg-primary text-primary-foreground" : "bg-card text-foreground")
            }
          >
            <Baby className="h-5 w-5" /> Simple words
          </button>

          <label className="flex min-h-tap items-center gap-2 rounded-md bg-card px-3 text-base font-semibold shadow-clay-sm">
            <Languages className="h-5 w-5 text-primary" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Output language"
              disabled={refreshing}
              className="bg-transparent py-2 pr-1 font-semibold outline-none disabled:opacity-60"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          {refreshing && (
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Updating
            </span>
          )}
        </div>
      </Item>

      {/* Urgency classification banner */}
      <Item>
        <UrgencyBanner tier={result.urgency_tier} brief={result.plain_language_brief} />
      </Item>

      {/* Plain-language explanation */}
      <Item>
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
              <BookOpenText className="h-4 w-4" /> What this means
            </h2>
            <div className="flex items-center gap-2">
              <ConfidenceBadge score={result.ai_confidence_score} />
              <ListenButton text={spoken} className="px-3 text-sm" />
            </div>
          </div>
          <Markdown>{result.plain_language_explanation_markdown}</Markdown>
        </Card>
      </Item>

      {/* Optional breakdown table (renders only when headers exist) */}
      <Item>
        <DataTable data={result.table_data} />
      </Item>
    </Stagger>
  );
}
