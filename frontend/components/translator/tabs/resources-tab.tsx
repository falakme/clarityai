"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ExternalLink,
  Loader2,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Item, Stagger } from "@/components/motion";
import type { Translator } from "@/lib/i18n";
import type { TranslateResult } from "@/lib/types";
import { buildShareText } from "./shared";

/**
 * Tab 3 — Resources.
 * The agentic "Verified Local Support" card and the Responsible AI &
 * Human-in-the-Loop block sit side by side on desktop. The "Open verified
 * resource" and "Share plan" actions stay disabled until the user ticks the
 * acknowledgement checkbox. `acknowledged` is owned by the orchestrator so it
 * survives tab switches.
 */
export function ResourcesTab({
  result,
  recommendationLoading,
  acknowledged,
  onAcknowledgedChange,
  t,
}: {
  result: TranslateResult;
  recommendationLoading: boolean;
  acknowledged: boolean;
  onAcknowledgedChange: (next: boolean) => void;
  t: Translator;
}) {
  const [shareMsg, setShareMsg] = useState("");
  const hasResource = Boolean(result.local_support_resources && result.local_support_resources.length > 0);
  const hasTasks = result.task_list.length > 0;

  async function sharePlan() {
    const textToShare = buildShareText(result);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "My ClarityAI action plan", text: textToShare });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare);
        setShareMsg(t("copied"));
        setTimeout(() => setShareMsg(""), 2500);
      }
    } catch {
      /* user cancelled the share sheet — ignore */
    }
  }

  return (
    <Stagger className="grid gap-4 lg:grid-cols-2 lg:items-start">
      {/* Verified Local Support — agentic recommendation (AI-evaluated) */}
      <Item>
        {recommendationLoading && !hasResource ? (
          <Card className="border border-emerald-200 bg-emerald-50/40">
            <h2 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <BadgeCheck className="h-4 w-4" /> {t("verified_support")}
            </h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              {t("finding_resource")}
            </p>
          </Card>
        ) : hasResource ? (
          <Card className="border border-emerald-200 bg-emerald-50/40">
            <h2 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <BadgeCheck className="h-4 w-4" /> {t("verified_support")}
            </h2>
            <div className="mt-2 space-y-2">
              {result.local_support_resources?.map((url, i) => (
                <p key={i} className="break-all text-sm font-medium text-foreground">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {url}
                  </a>
                </p>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <BadgeCheck className="h-4 w-4" /> {t("verified_support")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("no_resource")}</p>
          </Card>
        )}
      </Item>

      {/* Responsible AI & Human-in-the-Loop Safeguards (amber gateway) */}
      <Item>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <ShieldCheck className="h-4 w-4" /> {t("responsible_ai")}
          </h2>

          {/* Confidence indicator */}
          <div className="mt-2 rounded-md bg-card/70 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>
                {t("confidence_label")}: {result.confidence_percent}% {t("confidence_anchoring")}
              </span>
              <span>{result.ai_confidence_score}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/70">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${result.confidence_percent}%` }}
              />
            </div>
          </div>

          {/* Mandatory human-in-the-loop acknowledgement */}
          <div className="my-3">
            <Checkbox
              id="hitl-ack"
              checked={acknowledged}
              onCheckedChange={onAcknowledgedChange}
              labelClassName="text-xs leading-relaxed"
              label={t("ack_label")}
            />
          </div>

          {/* Gated external actions — disabled until the box is ticked */}
          <div className="mt-3 space-y-2">
            {!acknowledged && (
              <p className="text-xs font-medium text-amber-800">{t("unlock_hint")}</p>
            )}

            {hasResource &&
              (acknowledged ? (
                <div className="flex flex-col gap-2">
                  {result.local_support_resources?.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ size: "sm", className: "w-full" })}
                    >
                      <ExternalLink className="h-4 w-4" /> {t("open_resource")} {i > 0 ? i + 1 : ""}
                    </a>
                  ))}
                </div>
              ) : (
                <Button size="sm" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4" /> {t("open_resource")}
                </Button>
              ))}

            {hasTasks && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={sharePlan}
                  disabled={!acknowledged}
                >
                  <Share2 className="h-4 w-4" /> {t("share_plan")}
                </Button>
                {shareMsg && <p className="text-center text-xs text-emerald-700">{shareMsg}</p>}
              </>
            )}
          </div>
        </div>
      </Item>
    </Stagger>
  );
}
