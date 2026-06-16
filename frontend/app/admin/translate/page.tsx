"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ApiError, translateForm } from "@/lib/api";
import type { TranslateResult } from "@/lib/types";

const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Eviction notice",
    text: `NOTICE TO QUIT AND VACATE — NON-PAYMENT OF RENT

YOU ARE HEREBY NOTIFIED that rent in the amount of $1,850.00 is now past due. Pursuant to applicable state landlord-tenant statutes, you are required to PAY the full amount due OR VACATE the premises within FOURTEEN (14) DAYS of service of this notice.

IF YOU FAIL to either pay the amount demanded or vacate within this period, the landlord may commence summary eviction (unlawful detainer) proceedings against you in the appropriate court.`,
  },
  {
    label: "FEMA housing",
    text: `FEDERAL EMERGENCY MANAGEMENT AGENCY — INDIVIDUALS AND HOUSEHOLDS PROGRAM (IHP)
TEMPORARY HOUSING ASSISTANCE — TERMS AND CONDITIONS

DEADLINE: Applications for disaster DR-4729 must be received no later than 11:59 PM Central Time on August 30, 2025.

REQUIRED SUPPORTING DOCUMENTATION: (1) a government-issued photo identification; (2) proof of occupancy such as a utility bill or lease agreement; and (3) proof of identity for all household members listed.`,
  },
];

export default function AdminTranslateTester() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ms, setMs] = useState<number | null>(null);

  async function run() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setMs(null);
    const started = performance.now();
    try {
      const res = await translateForm({ text });
      setResult(res);
      setMs(Math.round(performance.now() - started));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${e.status}: ${e.message}`
          : "Request failed — backend unreachable.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">AI pipeline tester</h2>
          {ms !== null && <Badge variant="info">{ms} ms</Badge>}
        </div>
        <p className="mb-4 text-base text-muted-foreground">
          Send raw form text directly to <code>POST /api/translate-form</code> and inspect
          the structured response. Useful for verifying the model and prompt.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <Button
              key={s.label}
              variant="outline"
              size="sm"
              onClick={() => setText(s.text)}
            >
              <FileText className="h-4 w-4" /> {s.label}
            </Button>
          ))}
        </div>

        <Textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste government form text or load a sample above…"
          aria-label="Text to translate"
        />

        <Button size="lg" className="mt-4 w-full" onClick={run} disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
          {loading ? "Running…" : "Run translation"}
        </Button>

        {error && (
          <p className="mt-4 rounded-md bg-warning/15 p-3 text-base text-amber-800">{error}</p>
        )}
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <Card>
              <h3 className="mb-3 text-lg font-bold">Parsed result</h3>
              <dl className="space-y-3 text-base">
                <Field
                  label="Explanation (markdown)"
                  value={`${result.plain_language_explanation_markdown.length} chars`}
                />
                <Field label="Task list" value={`${result.task_list.length} tasks`} />
                <Field
                  label="Table"
                  value={
                    result.table_data.headers.length
                      ? `${result.table_data.headers.length} cols × ${result.table_data.rows.length} rows`
                      : "— empty —"
                  }
                />
                <Field label="Diagram steps" value={`${result.diagram_steps.length} steps`} />
                <Field
                  label="Source text"
                  value={`${result.source_text.length} chars captured`}
                />
              </dl>
            </Card>

            <Card>
              <h3 className="mb-3 text-lg font-bold">Raw JSON</h3>
              <pre className="clay-inset overflow-x-auto p-4 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
