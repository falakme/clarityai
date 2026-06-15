import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "min-h-tap w-full rounded-md border-2 border-border bg-white/70 px-4 py-3 text-lg text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
