"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-(--color-fg) text-(--color-bg) hover:bg-(--color-fg)/90",
  secondary:
    "border border-(--color-border) bg-(--color-bg-elev) text-(--color-fg) hover:border-(--color-border-strong)",
  ghost: "text-(--color-fg-muted) hover:text-(--color-fg) hover:bg-(--color-fg)/5",
  outline: "border border-(--color-border) bg-transparent text-(--color-fg) hover:bg-(--color-fg)/5",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-full",
  md: "h-10 px-5 text-sm gap-2 rounded-full",
  lg: "h-12 px-6 text-base gap-2 rounded-full",
  icon: "h-8 w-8 rounded-lg",
};

export const PRESS_SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.6 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", pressScale = 0.93, className, children, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={reduce ? undefined : { scale: pressScale }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={PRESS_SPRING}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none",
        "transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
