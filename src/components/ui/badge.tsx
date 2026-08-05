import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-elevated text-muted",
        teal: "border-transparent bg-[color-mix(in_oklab,var(--color-teal)_18%,transparent)] text-teal",
        outline: "border-border-strong text-fg",
        warn: "border-transparent bg-[color-mix(in_oklab,var(--color-warn)_16%,transparent)] text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
