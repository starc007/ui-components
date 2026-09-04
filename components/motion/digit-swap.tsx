"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type DigitSwapDirection = "up" | "down";

export interface DigitSwapProps {
  /** Numeric or masked value rendered in fixed character slots. */
  value: string | number;
  /** Replays every glyph when the value itself contains unchanged characters. */
  animationKey?: string | number;
  /** Direction the next glyph enters from. */
  direction?: DigitSwapDirection;
  /** Per-glyph transition duration in seconds. */
  duration?: number;
  /** Delay in seconds between neighboring glyphs. */
  stagger?: number;
  /** Number of final characters that receive `suffixClassName`. */
  suffixLength?: number;
  className?: string;
  glyphClassName?: string;
  suffixClassName?: string;
}

type GlyphMotionContext = {
  direction: DigitSwapDirection;
  reduceMotion: boolean;
};

const GLYPH_VARIANTS = {
  enter: ({ direction, reduceMotion }: GlyphMotionContext) => ({
    opacity: 0,
    transform: reduceMotion
      ? "none"
      : `translateY(${direction === "up" ? "45%" : "-45%"})`,
  }),
  visible: {
    opacity: 1,
    transform: "translateY(0%)",
  },
  exit: ({ direction, reduceMotion }: GlyphMotionContext) => ({
    opacity: 0,
    transform: reduceMotion
      ? "none"
      : `translateY(${direction === "up" ? "-45%" : "45%"})`,
  }),
};

/** Fixed-slot digits and mask glyphs that roll when their value changes. */
export function DigitSwap({
  value,
  animationKey,
  direction = "up",
  duration = 0.18,
  stagger = 0.006,
  suffixLength = 0,
  className,
  glyphClassName,
  suffixClassName,
}: DigitSwapProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const text = String(value);
  const suffixStart = Math.max(0, text.length - Math.max(0, suffixLength));
  const motionContext: GlyphMotionContext = { direction, reduceMotion };
  const glyphs = Array.from(text, (character, position) => ({
    character,
    id: `glyph-${position}`,
    position,
  }));

  return (
    <span
      data-slot="digit-swap"
      data-direction={direction}
      className={cn("inline-flex items-center whitespace-nowrap", className)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        {glyphs.map(({ character, id, position }) => {
          if (character === " ") {
            return <span key={id} className="inline-block w-[0.7ch]" />;
          }

          const glyphKey =
            animationKey === undefined
              ? `${id}-${character}`
              : `${id}-${character}-${animationKey}`;

          return (
            <span
              key={id}
              data-slot="digit-swap-glyph"
              className="relative inline-block h-[1.1em] w-[1ch] shrink-0 overflow-hidden align-bottom"
            >
              <AnimatePresence initial={false} custom={motionContext}>
                <motion.span
                  key={glyphKey}
                  custom={motionContext}
                  variants={GLYPH_VARIANTS}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                  transition={{
                    duration: reduceMotion ? Math.min(duration, 0.12) : duration,
                    delay: reduceMotion ? 0 : position * stagger,
                    ease: EASE_OUT,
                  }}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center leading-none",
                    glyphClassName,
                    position >= suffixStart ? suffixClassName : undefined,
                  )}
                >
                  {character}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>
    </span>
  );
}
