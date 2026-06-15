"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label: React.ReactNode;
  className?: string;
}

/** Large, accessible checkbox with a 48px tap target for stressed users. */
export function Checkbox({ checked, onCheckedChange, id, label, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-tap cursor-pointer items-center gap-4 rounded-md border-2 border-transparent bg-white/50 p-3 transition-colors hover:bg-white",
        checked && "border-primary/30 bg-primary/5",
        className,
      )}
    >
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          checked ? "border-primary bg-primary text-white" : "border-muted-foreground/40 bg-white",
        )}
      >
        {checked && <Check className="h-5 w-5" strokeWidth={3} />}
      </button>
      <span className={cn("text-lg", checked && "text-muted-foreground line-through")}>
        {label}
      </span>
    </label>
  );
}
