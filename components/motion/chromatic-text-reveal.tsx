"use client";

import {
  type MotionStyle,
  motion,
  type UseInViewOptions,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const CHROMATIC_PALETTE = [
  "#60a5fa",
  "#818cf8",
  "#c084fc",
  "#fb7185",
  "#fbbf24",
];

const TRAIL_HALF_WIDTH = 14;
const REVEAL_START = `-${TRAIL_HALF_WIDTH}%`;
const REVEAL_FINISH = `${100 + TRAIL_HALF_WIDTH}%`;

export type ChromaticTextRevealProps = {
  /** Sentence fragment that remains fixed while the final word changes. */
  prefix: string;
  /** Words revealed one after another after the fixed prefix. */
  words: string[];
  /** Colors used along the moving chromatic edge. */
  colors?: string[];
  /** Final text color after the sweep passes. */
  foregroundColor?: string;
  /** Sweep duration in seconds. */
  duration?: number;
  /** Delay before the first sweep, in seconds. */
  delay?: number;
  /** Rest after a word finishes revealing, in seconds. */
  pauseDuration?: number;
  /** Returns to the first word after the final word. */
  loop?: boolean;
  /** Starts when the text enters the viewport. */
  startOnView?: boolean;
  /** Only starts on the first viewport entry. */
  once?: boolean;
  /** IntersectionObserver root margin used by the viewport trigger. */
  inViewMargin?: UseInViewOptions["margin"];
  className?: string;
};

function composeChromaticGradient(colors: string[], foregroundColor: string) {
  const palette = colors.length > 0 ? colors : CHROMATIC_PALETTE;
  const colorStops = palette.map((color, index) => {
    const offset =
      palette.length === 1
        ? 0
        : -TRAIL_HALF_WIDTH +
          (index / (palette.length - 1)) * TRAIL_HALF_WIDTH * 2;
    const operator = offset < 0 ? "-" : "+";
    const distance = Number(Math.abs(offset).toFixed(2));
    return `${color} calc(var(--chromatic-sweep) ${operator} ${distance}%)`;
  });

  return `linear-gradient(90deg, ${foregroundColor} 0%, ${foregroundColor} calc(var(--chromatic-sweep) - ${TRAIL_HALF_WIDTH}%), ${colorStops.join(", ")}, transparent calc(var(--chromatic-sweep) + ${TRAIL_HALF_WIDTH}%), transparent 100%)`;
}

export function ChromaticTextReveal({
  prefix,
  words,
  colors = CHROMATIC_PALETTE,
  foregroundColor = "var(--foreground)",
  duration = 1.2,
  delay = 0,
  pauseDuration = 0.8,
  loop = true,
  startOnView = true,
  once = true,
  inViewMargin,
  className,
}: ChromaticTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once,
    margin: inViewMargin,
    amount: 0.4,
  });
  const shouldReveal = !startOnView || isInView || reduceMotion;
  const backgroundImage = composeChromaticGradient(colors, foregroundColor);
  const hasWords = words.length > 0;
  const activeIndex = hasWords ? wordIndex % words.length : 0;
  const activeWord = words[activeIndex] ?? "";
  const sizingWords = Array.from(new Set(words));

  const clearPendingWord = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNextWord = useCallback(() => {
    clearPendingWord();
    const isLastWord = activeIndex === words.length - 1;
    if (
      reduceMotion ||
      !shouldReveal ||
      words.length < 2 ||
      (isLastWord && !loop)
    ) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setWordIndex((index) => (index + 1) % words.length);
    }, pauseDuration * 1000);
  }, [
    activeIndex,
    clearPendingWord,
    loop,
    pauseDuration,
    reduceMotion,
    shouldReveal,
    words.length,
  ]);

  useEffect(() => clearPendingWord, [clearPendingWord]);

  return (
    <span ref={ref} className={cn("inline-flex items-baseline", className)}>
      <span className="whitespace-nowrap">
        {prefix}
        {hasWords ? "\u00A0" : null}
      </span>
      {hasWords ? (
        <span className="relative inline-grid">
          {sizingWords.map((word) => (
            <span
              key={word}
              aria-hidden
              className="invisible col-start-1 row-start-1 whitespace-nowrap"
            >
              {word}
            </span>
          ))}
          {/* Moving a clipped text gradient defines this effect. Paint
              containment bounds that deliberate repaint to the active word. */}
          <motion.span
            key={`${activeWord}-${activeIndex}`}
            aria-hidden
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0.56,
                    filter: "blur(6px)",
                    transform: "translateY(5px)",
                  }
            }
            animate={{
              "--chromatic-sweep": shouldReveal
                ? REVEAL_FINISH
                : REVEAL_START,
              opacity: 1,
              filter: "blur(0px)",
              transform: "translateY(0px)",
            }}
            transition={{
              "--chromatic-sweep": reduceMotion
                ? { duration: 0 }
                : { duration, delay, ease: EASE_IN_OUT },
              opacity: reduceMotion
                ? { duration: 0 }
                : { duration: 0.28, ease: EASE_OUT },
              filter: reduceMotion
                ? { duration: 0 }
                : { duration: 0.36, ease: EASE_OUT },
              transform: reduceMotion
                ? { duration: 0 }
                : { duration: 0.36, ease: EASE_OUT },
            }}
            onAnimationComplete={scheduleNextWord}
            className="absolute start-0 top-0 whitespace-nowrap bg-clip-text text-transparent [background-image:var(--chromatic-gradient)] [contain:paint]"
            style={{
              "--chromatic-sweep": reduceMotion
                ? REVEAL_FINISH
                : REVEAL_START,
              "--chromatic-gradient": backgroundImage,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            } as MotionStyle}
          >
            {activeWord}
          </motion.span>
          <span className="sr-only">{activeWord}</span>
        </span>
      ) : null}
    </span>
  );
}
