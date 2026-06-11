"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, EASE_OUT_CSS, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type TextSlotDirection = "up" | "down";
export type TextSlotSplit = "none" | "word" | "char";

export interface TextSlotProps {
  /** Current text. Changing it rolls the old value out and the new one in. */
  text: string;
  /**
   * "none" rolls the whole string as one slot. "word" rolls per word with a
   * stagger; words that stay the same at their position hold still. "char"
   * cascades letter by letter — the old string's letters roll away while the
   * new string's letters land, left to right.
   */
  split?: TextSlotSplit;
  /** Roll direction. "up" enters from below and exits upward. */
  direction?: TextSlotDirection;
  /** Per-unit stagger in seconds. Defaults to 0.025 for "char", 0.04 otherwise. */
  stagger?: number;
  className?: string;
}

function buildVariants(direction: TextSlotDirection, reduce: boolean): Variants {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  const from = direction === "up" ? "110%" : "-110%";
  const to = direction === "up" ? "-110%" : "110%";
  return {
    initial: { y: from, opacity: 0, filter: "blur(4px)" },
    // Dynamic variant: per-word stagger rides in via `custom` — a plain
    // transition prop would lose to the variant-level transition.
    animate: (delay: number = 0) => ({
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: { ...SPRING_SWAP, delay },
    }),
    exit: {
      y: to,
      opacity: 0,
      filter: "blur(4px)",
      transition: { duration: 0.18, ease: EASE_OUT },
    },
  };
}

// Letters of the leaving and landing strings overlap as independent layers —
// no shared cells, so proportional glyph widths never jitter. Exits cascade
// at half the enter stagger so the tail of the old word lingers briefly.
function buildCharVariants(direction: TextSlotDirection, reduce: boolean): Variants {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  const from = direction === "up" ? "105%" : "-105%";
  const to = direction === "up" ? "-105%" : "105%";
  return {
    initial: { y: from, opacity: 0, filter: "blur(4px)" },
    animate: (delay: number = 0) => ({
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: { ...SPRING_SWAP, delay },
    }),
    exit: (delay: number = 0) => ({
      y: to,
      opacity: 0,
      filter: "blur(3px)",
      transition: { duration: 0.16, ease: EASE_OUT, delay: delay * 0.5 },
    }),
  };
}

/** Measures the natural width of the current text so the mask can ease to it. */
function useTextWidth() {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const nextWidth = ref.current?.offsetWidth;
    if (!nextWidth) return;
    setWidth((current) => (current === nextWidth ? current : nextWidth));
  });

  return [ref, width] as const;
}

export function TextSlot({
  text,
  split = "none",
  direction = "up",
  stagger,
  className,
}: TextSlotProps) {
  const reduce = useReducedMotion();
  const [sizerRef, width] = useTextWidth();
  const variants = buildVariants(direction, Boolean(reduce));
  const charVariants = buildCharVariants(direction, Boolean(reduce));
  const unitStagger = stagger ?? (split === "char" ? 0.025 : 0.04);
  const words = split === "word" ? text.split(" ") : null;
  const chars = split === "char" ? text.split("") : null;

  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden whitespace-pre align-bottom",
        className,
      )}
      style={{
        width,
        transition: reduce || !width ? undefined : `width 220ms ${EASE_OUT_CSS}`,
      }}
    >
      {/* Screen readers get the plain current text; the rolling copies below
          are decorative. */}
      <span className="sr-only">{text}</span>

      {/* Invisible sizer keeps the line box and drives the width ease. */}
      <span ref={sizerRef} aria-hidden className="invisible inline-block whitespace-pre">
        {text}
      </span>

      {chars ? (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            aria-hidden
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute left-0 top-0 inline-block whitespace-pre"
          >
            {chars.map((char, i) => (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity — the letter at a position is exactly what rolls.
                key={i}
                custom={i * unitStagger}
                variants={charVariants}
                className="inline-block whitespace-pre will-change-[transform,opacity,filter]"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      ) : words ? (
        <span aria-hidden className="absolute left-0 top-0 inline-flex whitespace-pre">
          {words.map((word, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity — a word change at a position is exactly what should re-roll.
              key={i}
              className="relative inline-block overflow-hidden whitespace-pre"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={word}
                  custom={i * unitStagger}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="inline-block whitespace-pre will-change-[transform,opacity,filter]"
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
        </span>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            aria-hidden
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute left-0 top-0 inline-block whitespace-pre will-change-[transform,opacity,filter]"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}
