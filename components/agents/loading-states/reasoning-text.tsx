"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Loader } from "@/components/motion/loader";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import {
  TEXT_SHIMMER_CLASS_NAME,
  TEXT_SHIMMER_KEYFRAMES,
  textShimmerStyle,
} from "@/lib/text-shimmer";
import { cn } from "@/lib/utils";

const DEFAULT_PHRASES = [
  "Thinking",
  "Reading the context",
  "Connecting the details",
  "Forming a response",
];

const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/";
const CASCADE_STAGGER = 0.025;

export type ReasoningTextVariant = "cascade" | "swap" | "scramble";

export interface ReasoningTextProps {
  /** Phrases cycled through while the agent works. */
  phrases?: string[];
  /** Animation used when the active phrase changes. */
  variant?: ReasoningTextVariant;
  /** Milliseconds each phrase remains visible. */
  interval?: number;
  /** Seconds taken for one shimmer pass. */
  shimmerDuration?: number;
  /** Optional leading visual. Defaults to a terminal-style ASCII loader. */
  indicator?: ReactNode;
  className?: string;
}

type PhraseProps = {
  phrase: string;
  reduce: boolean;
  shimmerDuration: number;
};

function CascadePhrase({
  phrase,
  reduce,
  shimmerDuration,
}: PhraseProps) {
  const text = `${phrase}…`;

  if (reduce) {
    return (
      <span
        className={cn(
          "col-start-1 row-start-1 inline-block justify-self-start whitespace-pre",
          TEXT_SHIMMER_CLASS_NAME,
        )}
        style={textShimmerStyle(shimmerDuration)}
      >
        {text}
      </span>
    );
  }

  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={phrase}
        className="col-start-1 row-start-1 inline-block justify-self-start whitespace-pre"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {text.split("").map((character, characterIndex) => (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: position is the stable cascade slot identity.
            key={characterIndex}
            custom={characterIndex * CASCADE_STAGGER}
            variants={{
              initial: { opacity: 0, y: "100%" },
              animate: (delay: number) => ({
                opacity: 1,
                y: "0%",
                transition: { ...SPRING_SWAP, delay },
              }),
              exit: (delay: number) => ({
                opacity: 0,
                y: "-100%",
                transition: {
                  duration: 0.14,
                  ease: EASE_OUT,
                  delay: delay * 0.45,
                },
              }),
            }}
            className={cn(
              "inline-block whitespace-pre will-change-[opacity,transform]",
              TEXT_SHIMMER_CLASS_NAME,
            )}
            style={textShimmerStyle(shimmerDuration)}
          >
            {character}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

function SwapPhrase({ phrase, reduce, shimmerDuration }: PhraseProps) {
  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={phrase}
        className={cn(
          "col-start-1 row-start-1 inline-block justify-self-start whitespace-nowrap will-change-[opacity,transform]",
          TEXT_SHIMMER_CLASS_NAME,
        )}
        style={textShimmerStyle(shimmerDuration)}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 3 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
        transition={{
          duration: reduce ? 0.12 : 0.2,
          ease: EASE_OUT,
        }}
      >
        {phrase}…
      </motion.span>
    </AnimatePresence>
  );
}

function ScramblePhrase({
  phrase,
  reduce,
  shimmerDuration,
}: PhraseProps) {
  const target = `${phrase}…`;
  const [display, setDisplay] = useState(target);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    if (reduce) {
      setDisplay(target);
      return;
    }

    const characters = target.split("");
    const startedAt = performance.now();
    const duration = Math.min(760, Math.max(420, characters.length * 32));
    let frame = 0;
    let lastUpdate = 0;

    const animate = (now: number) => {
      if (now - lastUpdate >= 40) {
        lastUpdate = now;
        const progress = Math.min((now - startedAt) / duration, 1);
        const settled = Math.floor(progress * characters.length);

        setDisplay(
          characters
            .map((character, characterIndex) => {
              if (characterIndex < settled || character === " ") {
                return character;
              }
              return SCRAMBLE_GLYPHS[
                Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
              ];
            })
            .join(""),
        );
      }

      if (now - startedAt < duration) {
        frame = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [reduce, target]);

  return (
    <span
      className={cn(
        "col-start-1 row-start-1 inline-block justify-self-start whitespace-pre font-mono tabular-nums",
        TEXT_SHIMMER_CLASS_NAME,
      )}
      style={textShimmerStyle(shimmerDuration)}
    >
      {display}
    </span>
  );
}

export function ReasoningText({
  phrases = DEFAULT_PHRASES,
  variant = "cascade",
  interval = 1800,
  shimmerDuration = 2.2,
  indicator,
  className,
}: ReasoningTextProps) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const safePhrases = phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  const phrase = safePhrases[index % safePhrases.length];
  const longestPhrase = safePhrases.reduce((longest, current) =>
    current.length > longest.length ? current : longest,
  );
  const phraseProps = { phrase, reduce, shimmerDuration };

  useEffect(() => {
    if (safePhrases.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safePhrases.length);
    }, Math.max(600, interval));

    return () => window.clearInterval(timer);
  }, [interval, safePhrases.length]);

  return (
    <>
      <style>{TEXT_SHIMMER_KEYFRAMES}</style>
      <span
        role="status"
        aria-live="polite"
        aria-labelledby={statusId}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground",
          className,
        )}
      >
        <span aria-hidden="true" className="inline-flex size-3 shrink-0 items-center justify-center">
          {indicator ?? (
            <Loader
              variant="ascii-line"
              size={14}
              speed={0.8}
              label="Reasoning"
            />
          )}
        </span>

        <span aria-hidden="true" className="grid overflow-hidden text-left">
          <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {longestPhrase}…
          </span>
          {variant === "cascade" ? (
            <CascadePhrase {...phraseProps} />
          ) : variant === "scramble" ? (
            <ScramblePhrase {...phraseProps} />
          ) : (
            <SwapPhrase {...phraseProps} />
          )}
        </span>

        <span id={statusId} className="sr-only">
          {phrase}
        </span>
      </span>
    </>
  );
}
