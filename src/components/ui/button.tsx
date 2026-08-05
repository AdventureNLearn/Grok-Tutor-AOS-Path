import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--color-teal)_50%,transparent)] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-fg",
        secondary:
          "bg-elevated text-fg border border-border hover:border-border-strong hover:bg-[color-mix(in_oklab,var(--color-elevated)_80%,white)]",
        outline:
          "border border-border bg-transparent text-fg hover:bg-elevated hover:border-border-strong",
        ghost: "text-muted hover:text-fg hover:bg-elevated",
        teal: "bg-teal text-accent-fg hover:bg-teal-dim font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
