"use client";

import { markdownToPlainText, stripEmoji } from "@/lib/text";
import type { TranslateResult } from "@/lib/types";

/**
 * A clean, ink-friendly version of the full action plan. Hidden on screen
 * (`print-only`) and revealed only when printing, so the user gets a tidy
 * takeaway document no matter which dashboard tab is open.
 */
export function PrintablePlan({
  result,
  checked,
}: {
  result: TranslateResult;
  checked: Record<string, boolean>;
}) {
  const paragraphs = markdownToPlainText(result.plain_language_explanation_markdown)
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <div className="print-only" aria-hidden>
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "20pt", fontWeight: 800, margin: 0 }}>ClarityAI action plan</h1>
        <p style={{ margin: "4px 0 0", fontSize: "10pt" }}>
          Generated {new Date().toLocaleDateString()} · A plain-language guide, not legal,
          medical, or financial advice.
        </p>
      </div>

      <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Priority: {result.urgency_tier}</p>
      {result.plain_language_brief && (
        <p style={{ margin: "0 0 16px" }}>{stripEmoji(result.plain_language_brief)}</p>
      )}

      <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>What this means</h2>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ margin: "0 0 8px" }}>
          {p}
        </p>
      ))}

      {result.diagram_steps.length > 0 && (
        <>
          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>
            Step-by-step path
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
            Action checklist
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {result.task_list.map((t) => (
              <li key={t.id} style={{ margin: "0 0 6px" }}>
                {checked[String(t.id)] ? "[x] " : "[ ] "}
                {stripEmoji(t.task)}
              </li>
            ))}
          </ul>
        </>
      )}

      {result.local_support_resources && result.local_support_resources.length > 0 && (
        <>
          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "16px 0 6px" }}>
            Verified local support
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
