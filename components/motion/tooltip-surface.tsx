"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useMemo, type ComponentProps, type ReactNode, type Ref } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";

// Offset is in the direction *away* from the trigger — content originates near
// the trigger and rises into resting position.
const offsetFrom: Record<Side, { x?: number; y?: number }> = {
  top: { y: 8 },
  bottom: { y: -8 },
  left: { x: 8 },
  right: { x: -8 },
};

// Small tooltip surfaces need the lighter spawn used by the original Tooltip.
const TOOLTIP_SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } as const;

function buildVariants(side: Side): Variants {
  const o = offsetFrom[side];
  return {
    initial: {
      opacity: 0,
      scale: 0.9,
      filter: "blur(5px)",
      x: o.x ?? 0,
      y: o.y ?? 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
      transition: {
        ...TOOLTIP_SPRING,
        opacity: { duration: 0.14, ease: EASE_OUT },
        filter: { duration: 0.18, ease: EASE_OUT },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.94,
      filter: "blur(3px)",
      x: (o.x ?? 0) * 0.6,
      y: (o.y ?? 0) * 0.6,
      transition: { duration: 0.12, ease: EASE_OUT },
    },
  };
}

const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.14, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } },
};

/** The shared visual surface for trigger tooltips and chart readouts. Positioning belongs to the caller. */
export function TooltipSurface({
  children,
  side = "top",
  className,
  ref,
  ...props
}: Omit<ComponentProps<typeof motion.span>, "children"> & {
  children?: ReactNode;
  side?: Side;
  ref?: Ref<HTMLSpanElement>;
}) {
  const reduce = useReducedMotion();
  const variants = useMemo(() => reduce ? REDUCED_VARIANTS : buildVariants(side), [reduce, side]);
  return (
    <motion.span
      ref={ref}
      role="tooltip"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
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
