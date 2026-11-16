"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface MorphLabelProps {
  /** The label to show; `null` folds the slot to nothing. */
  text: string | null;
  /** 1 rolls the new label up from below, -1 drops it in from above. */
  direction?: 1 | -1;
  className?: string;
}

const ROLL = 10;
const EXIT = { duration: 0.12, ease: EASE_OUT } as const;
// Opacity on its own quick curve, so the new label is readable before the
// old one has gone: the slot never shows a blank frame mid-swap.
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;

type Swap = { dir: number; reduce: boolean };

const VARIANTS = {
  enter: ({ dir, reduce }: Swap) => ({
    opacity: 0,
    y: reduce ? 0 : dir * ROLL,
    filter: reduce ? "blur(0px)" : "blur(3px)",
  }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: ({ dir, reduce }: Swap) => ({
    opacity: 0,
    y: reduce ? 0 : -dir * ROLL,
    filter: reduce ? "blur(0px)" : "blur(3px)",
    transition: EXIT,
  }),
};

/**
 * A label slot that morphs: its width springs to fit each new label (or to
 * nothing), while the words roll through it. The width is measured from the
 * text and animated directly, so it holds up inside any layout, including
 * columns and transformed parents, where layout projection can misplace
 * children.
 */
export function MorphLabel({ text, direction = 1, className }: MorphLabelProps) {
  const reduce = Boolean(useReducedMotion());
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  // Re-measure after every render: the text, the font or a translation can
  // all change the label's width.
  useLayoutEffect(() => {
    const next = text === null ? 0 : (measureRef.current?.offsetWidth ?? 0);
    setWidth((current) => (current === next ? current : next));
  });

  const custom: Swap = { dir: direction, reduce };

  return (
    <motion.span
      initial={false}
      animate={{ width }}
      transition={reduce ? { duration: 0 } : SPRING_SWAP}
      className="relative inline-flex h-full shrink-0 items-center overflow-hidden whitespace-nowrap"
    >
      {/* Invisible copy that sets the target width; it never takes space. */}
      <span ref={measureRef} aria-hidden="true" className={cn("invisible absolute whitespace-nowrap", className)}>
        {text}
      </span>
      <AnimatePresence initial={false} mode="popLayout" custom={custom}>
        {text === null ? null : (
          <motion.span
            key={text}
            custom={custom}
            variants={VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...SPRING_SWAP, opacity: FADE_IN }}
            className={cn("inline-block whitespace-nowrap", className)}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
