"use client";

import { useTypewriter } from "@/lib/use-typewriter";
import { Markdown } from "./markdown";

/**
 * Reveals an assistant message with a typewriter effect.
 *
 * While typing, the partial text is shown as pre-wrapped plain text with a
 * soft blinking caret — this avoids the visual jitter of re-parsing
 * half-finished Markdown on every frame. The moment it finishes, it swaps to
 * the fully formatted Markdown render. With `animate={false}` (restored
 * history) it renders the formatted Markdown immediately.
 */
export function TypewriterMarkdown({
  text,
  animate = true,
  onTick,
}: {
  text: string;
  animate?: boolean;
  onTick?: () => void;
}) {
  const { displayed, done } = useTypewriter(text, { enabled: animate, onTick });

  if (done) return <Markdown>{text}</Markdown>;

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {displayed}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse rounded-full bg-primary"
      />
    </p>
  );
}
