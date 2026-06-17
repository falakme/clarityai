"use client";

import { CheckSquare, FileText, Link as LinkIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "summary" | "tasks" | "resources" | "settings";

export const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "resources", label: "Resources", icon: LinkIcon },
  { key: "settings", label: "Settings", icon: Settings },
];

type Attention = Partial<Record<TabKey, boolean>>;

/**
 * Floating, glassmorphic bottom navigation. Shown on phones and tablets
 * (hidden at `lg`, where the sidebar takes over). `attention` puts a dot on a
 * tab that needs the user's input.
 */
export function BottomNav({
  active,
  onChange,
  attention,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  attention?: Attention;
}) {
  return (
    <nav
      aria-label="Sections"
      className="print-hidden pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
    >
      <div className="pointer-events-auto mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-stretch justify-around gap-1 rounded-2xl border border-white/60 bg-white/80 p-1.5 shadow-clay backdrop-blur-lg">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-xs font-bold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-clay-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {attention?.[key] && !isActive && (
                    <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Vertical sidebar navigation for tablet-landscape / desktop (`lg+`). Larger
 * tap rows with icon + label, matching the bottom nav's active styling.
 */
export function SideNav({
  active,
  onChange,
  attention,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  attention?: Attention;
}) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-1.5">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-clay-primary"
                : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
            )}
          >
            <span className="relative">
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              {attention?.[key] && !isActive && (
                <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
