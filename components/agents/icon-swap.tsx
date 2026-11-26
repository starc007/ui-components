"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface IconSwapProps {
  /** Changes whenever the icon should change (copy → copied, running → done). */
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Crossfades one status icon into the next with a little scale and a 2px
 * blur, so the change reads as one icon morphing rather than two crossing.
 * Reduced motion keeps the fade and drops the scale.
 */
export function IconSwap({ id, children, className }: IconSwapProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(2px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(2px)" }}
        transition={reduce ? { duration: 0.12 } : SPRING_SWAP}
        className={cn("grid place-items-center", className)}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
