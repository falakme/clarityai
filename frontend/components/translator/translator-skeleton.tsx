import { Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Calming skeleton state shown while the AI translates. */
export function TranslatorSkeleton() {
  return (
    <Card aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-xl font-semibold">Reading your document</p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-emerald-800">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 animate-pulse" />
        <span className="text-xs font-semibold">
          Privacy Protected: Redacting sensitive PII before AI processing...
        </span>
      </div>

      <p className="mt-4 text-base text-muted-foreground">
        Pulling out the deadlines, the costs, and exactly what to do next. This takes a few
        seconds.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <div className="skeleton mb-3 h-4 w-32" />
          <div className="skeleton h-7 w-full" />
          <div className="skeleton mt-2 h-7 w-4/5" />
        </div>
        <div>
          <div className="skeleton mb-3 h-4 w-28" />
          <div className="skeleton h-12 w-2/3" />
        </div>
        <div className="space-y-3">
          <div className="skeleton h-4 w-36" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-5/6" />
        </div>
      </div>
    </Card>
  );
}
