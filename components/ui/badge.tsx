import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
  {
    variants: {
      variant: {
        default: "bg-(--color-bg-elev) text-(--color-fg) border-(--color-border)",
        accent: "bg-(--color-accent)/15 text-(--color-accent) border-(--color-accent)/30",
        success: "bg-(--color-success)/15 text-(--color-success) border-(--color-success)/30",
        warning: "bg-(--color-warning)/15 text-(--color-warning) border-(--color-warning)/30",
        danger: "bg-(--color-danger)/15 text-(--color-danger) border-(--color-danger)/30",
        outline: "bg-transparent text-(--color-fg) border-(--color-border)",
        dot: "bg-(--color-bg-elev) text-(--color-fg) border-(--color-border) pl-1.5",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

export function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dotColor ?? "var(--color-accent)" }}
        />
      ) : null}
      {children}
    </span>
  );
}
