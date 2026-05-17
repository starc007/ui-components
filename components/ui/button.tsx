"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-(--color-fg) text-(--color-bg) hover:bg-(--color-fg)/90 shadow-sm",
        accent:
          "bg-(--color-accent) text-(--color-accent-fg) hover:brightness-110 shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-accent)_40%,transparent),0_8px_24px_-8px_var(--color-accent)]",
        secondary:
          "bg-(--color-bg-elev) text-(--color-fg) border border-(--color-border) hover:border-(--color-border-strong)",
        ghost:
          "text-(--color-fg) hover:bg-(--color-bg-elev)",
        outline:
          "border border-(--color-border) text-(--color-fg) hover:bg-(--color-bg-elev) hover:border-(--color-border-strong)",
        destructive:
          "bg-(--color-danger) text-white hover:brightness-110",
        link:
          "text-(--color-accent) underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";
