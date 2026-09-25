"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** Presentation only: the unanimated parent owns measurement and positioning. */
export function TooltipSurface({
  children,
  side: _side = "top",
  className,
  ref,
  ...props
}: Omit<ComponentProps<typeof motion.span>, "children"> & {
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  ref?: Ref<HTMLSpanElement>;
}) {
  return (
    <motion.span
      ref={ref}
      role="tooltip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.12, ease: EASE_OUT } }}
      exit={{ opacity: 0, transition: { duration: 0.08, ease: EASE_OUT } }}
      className={cn(
        "block whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
