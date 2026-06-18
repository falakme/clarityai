"use client";

import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { stripEmoji } from "@/lib/text";
import type { Translator } from "@/lib/i18n";
import type { TaskItem } from "@/lib/types";

/**
 * Interactive checklist (CONTROLLED).
 *
 * Checked state is owned by a parent (the TranslatorApp orchestrator) and
 * persisted to localStorage there, so it is lifted high enough to survive
 * switching between dashboard tabs without wiping the user's progress.
 *
 * FAILSAFE: renders nothing when there are no tasks.
 */
export function TaskList({
  tasks,
  checked,
  onToggle,
  storageKey,
  t,
}: {
  tasks: TaskItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  /** Used only to namespace the checkbox element ids. */
  storageKey: string;
  t: Translator;
}) {
  if (!tasks || tasks.length === 0) return null;

  const doneCount = tasks.filter((task) => checked[String(task.id)]).length;
  const pct = (doneCount / tasks.length) * 100;

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <ListChecks className="h-4 w-4" /> {t("action_checklist")}
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {doneCount}/{tasks.length} {t("done")}
        </span>
      </div>

      <Progress value={pct} className="mb-3" />

      <div className="space-y-1.5">
        {tasks.map((task) => {
          const key = String(task.id);
          return (
            <Checkbox
              key={key}
              id={`task-${storageKey}-${key}`}
              label={stripEmoji(task.task)}
              labelClassName="text-sm"
              checked={!!checked[key]}
              onCheckedChange={(v) => onToggle(key, v)}
            />
          );
        })}
      </div>
    </Card>
  );
}
