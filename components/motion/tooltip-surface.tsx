"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const ENTER = { duration: 0.18, ease: EASE_OUT };
const EXIT = { duration: 0.12, ease: EASE_OUT };
const INSTANT = { duration: 0 };

/**
 * `custom` is the `instant` flag. An exiting surface reads it from its
 * `AnimatePresence`, so a tooltip replaced by a neighbour vanishes at once
 * even though it has already left the React tree.
 */
const variants = (reduce: boolean): Variants => ({
  closed: (instant = false) => ({
    opacity: 0,
    scale: reduce ? 1 : 0.97,
    transition: instant ? INSTANT : EXIT,
  }),
  open: (instant = false) => ({
    opacity: 1,
    scale: 1,
    transition: instant ? INSTANT : ENTER,
  }),
});

/** Presentation only: the unanimated parent owns measurement and positioning. */
export function TooltipSurface({
  children,
  className,
  ref,
  ready = true,
  instant = false,
  style,
  ...props
}: Omit<ComponentProps<typeof motion.span>, "children"> & {
  children?: ReactNode;
  /** Start the entrance only after the positioning layer has been measured. */
  ready?: boolean;
  /**
   * Appear and disappear without animating: a label opened from the keyboard,
   * or one of a row of tooltips the pointer is moving along.
   */
  instant?: boolean;
  ref?: Ref<HTMLSpanElement>;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.span
      ref={ref}
      role="tooltip"
      custom={instant}
      variants={variants(reduce)}
      initial="closed"
      animate={ready ? "open" : "closed"}
      exit="closed"
      style={{ transformOrigin: "var(--tooltip-origin, center)", ...style }}
      className={cn(
        "block whitespace-nowrap rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
