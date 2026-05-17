"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium select-none",
    "outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)",
    "disabled:opacity-50 disabled:pointer-events-none",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
    "active:translate-y-px active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-(--color-fg) text-(--color-bg) hover:brightness-110 shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset,0_4px_14px_-4px_rgb(0_0_0/0.35)]",
        accent: [
          "text-(--color-accent-fg) bg-(--color-accent)",
          "shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_0_0_1px_color-mix(in_oklch,var(--color-accent)_40%,transparent),0_10px_30px_-10px_var(--color-accent)]",
          "hover:brightness-110",
          "before:absolute before:inset-0 before:rounded-lg before:bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.35)_50%,transparent_70%)] before:bg-[length:220%_100%] before:bg-[position:200%_0] before:opacity-0 hover:before:opacity-100 hover:before:bg-[position:-200%_0] before:transition-[background-position,opacity] before:duration-1000",
          "overflow-hidden",
        ].join(" "),
        secondary:
          "glass-thin text-(--color-fg) hover:border-(--color-border-strong)",
        ghost:
          "text-(--color-fg) hover:bg-(--color-bg-elev)",
        outline:
          "border border-(--color-border) text-(--color-fg) hover:bg-(--color-bg-elev) hover:border-(--color-border-strong)",
        destructive:
          "bg-(--color-danger) text-white hover:brightness-110 shadow-[0_8px_24px_-12px_var(--color-danger)]",
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
        <span className="relative inline-flex items-center gap-2">{children}</span>
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";
