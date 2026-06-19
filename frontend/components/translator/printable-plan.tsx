"use client";

import { markdownToPlainText, stripEmoji } from "@/lib/text";
import { createTranslator, type UiKey } from "@/lib/i18n";
import type { TranslateResult, UrgencyTier } from "@/lib/types";

const TIER_KEY: Record<UrgencyTier, UiKey> = {
  "Urgent Action Required": "urgency_urgent",
  "Time Sensitive": "urgency_time",
  "Informational Only": "urgency_info",
};

/**
 * A clean, ink-friendly version of the full action plan. Hidden on screen
 * (`print-only`) and revealed only when printing, so the user gets a tidy
 * takeaway document no matter which dashboard tab is open.
 */
export function PrintablePlan({
  result,
  checked,
  language = "English",
}: {
  result: TranslateResult;
  checked: Record<string, boolean>;
  language?: string;
}) {
  const t = createTranslator(language);
  const paragraphs = markdownToPlainText(result.plain_language_explanation_markdown)
    .split(/\n{2,}/)
    .filter(Boolean);
  const tierLabel = t(TIER_KEY[result.urgency_tier] ?? "urgency_info");

  return (
    <div className="print-only" aria-hidden>
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "20pt", fontWeight: 800, margin: 0 }}>{t("print_title")}</h1>
        <p style={{ margin: "4px 0 0", fontSize: "10pt" }}>
          {t("print_generated", { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{t("print_priority", { tier: tierLabel })}</p>
      {result.plain_language_brief && (
        <p style={{ margin: "0 0 16px" }}>{stripEmoji(result.plain_language_brief)}</p>
      )}

      <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>{t("what_this_means")}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ margin: "0 0 8px" }}>
          {p}
        </p>
      ))}

      {result.diagram_steps.length > 0 && (
        <>
          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>
            {t("print_step_path")}
          </h2>
          <ol style={{ margin: 0, paddingLeft: "20px" }}>
            {result.diagram_steps.map((s, i) => (
              <li key={i} style={{ margin: "0 0 6px" }}>
                <strong>{stripEmoji(s.title)}.</strong> {stripEmoji(s.description)}
              </li>
            ))}
          </ol>
        </>
      )}

      {result.task_list.length > 0 && (
        <>
          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>
            {t("action_checklist")}
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {result.task_list.map((task) => (
              <li key={task.id} style={{ margin: "0 0 6px" }}>
                {checked[String(task.id)] ? "[x] " : "[ ] "}
                {stripEmoji(task.task)}
              </li>
            ))}
          </ul>
        </>
      )}

      {result.local_support_resources && result.local_support_resources.length > 0 && (
        <>
          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>
            {t("verified_support")}
          </h2>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {result.local_support_resources.map((url, i) => (
              <li key={i} style={{ margin: "0 0 4px" }}>{url}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
