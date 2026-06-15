import { cn } from "@/lib/utils";

/** Calming shimmer placeholder used during AI translation. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} aria-hidden="true" />;
}
