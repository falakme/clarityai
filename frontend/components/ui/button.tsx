import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glass",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-glass",
        outline: "border-2 border-primary/30 bg-white/60 text-foreground hover:bg-white",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Massive tap targets — min 48px height.
        default: "min-h-tap px-6 py-3 text-lg",
        lg: "min-h-[60px] px-8 py-4 text-xl",
        sm: "min-h-tap px-4 py-2 text-base",
        icon: "min-h-tap min-w-tap",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
