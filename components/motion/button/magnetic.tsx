"use client";

import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { forwardRef, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Base Button (kept in-file so this snippet is self-contained) ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
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

const PRESS_SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.6 };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", pressScale = 0.93, className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={{ scale: pressScale }}
      whileHover={{ scale: 1.02 }}
      transition={PRESS_SPRING}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none transition-colors",
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

/* ---------- MagneticButton ---------- */

export interface MagneticButtonProps extends ButtonProps {
  /** Magnetic pull strength. Default 0.25. */
  strength?: number;
  /** Class applied to the magnetic wrapper. */
  magneticClassName?: string;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(function MagneticButton(
  { strength = 0.25, magneticClassName, children, ...rest },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", magneticClassName)}
    >
      <Button ref={ref} {...rest}>
        {children}
      </Button>
    </motion.div>
  );
});
