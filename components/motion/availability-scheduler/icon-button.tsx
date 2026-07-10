"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function IconButton({
  onClick,
  label,
  disabled,
  expanded,
  reduce,
  children,
  className,
  // Rest props let a wrapping Tooltip inject its hover/focus handlers.
  ...rest
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  expanded?: boolean;
  reduce: boolean;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <motion.button
      {...rest}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.86 }}
      transition={SPRING_PRESS}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
