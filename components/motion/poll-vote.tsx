"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_IN, EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const pollVoteMessages = {
  poll: "Poll",
  percent: "{label}, {percent}%",
  voted: "You voted for {label}",
  votes: "{count} votes",
};

export type PollVoteMessages = typeof pollVoteMessages;

export type PollOption = { id: string; label: string; votes: number };

export interface PollVoteProps {
  options: PollOption[];
  /** The viewer's choice, or null before they vote. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  labels?: Partial<PollVoteMessages>;
  className?: string;
}

// After a first vote your bar fills first and the rest follow a beat apart.
const STAGGER = 0.06;
const COUNT = { duration: 0.7, ease: EASE_OUT } as const;
const DRAW = { duration: 0.26, ease: EASE_OUT, delay: 0.08 } as const;
const FADE = { duration: 0.2, ease: EASE_OUT } as const;
// Clearing drains the bars quickly; exits are faster than entrances.
const DRAIN = { duration: 0.22, ease: EASE_IN } as const;

/** A number that counts up (or down) to its value. */
function Count({
  value,
  delay,
  reduce,
  format,
}: {
  value: number;
  delay: number;
  reduce: boolean;
  format: (value: number) => string;
}) {
  const shown = useMotionValue(value);
  const text = useTransform(shown, (current) => format(Math.round(current)));
  useEffect(() => {
    const controls = animate(shown, value, reduce ? { duration: 0 } : { ...COUNT, delay });
    return () => controls.stop();
  }, [value, delay, reduce, shown]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/** The radio ring: fills with a pop and draws a check when it is your pick. */
function Mark({ on, reduce }: { on: boolean; reduce: boolean }) {
  return (
    <span
      className={cn(
        "relative grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-200",
        on ? "border-primary" : "border-muted-foreground/40",
      )}
    >
      <motion.span
        className="absolute -inset-px rounded-full bg-primary"
        initial={false}
        animate={{ scale: on || reduce ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={on ? { scale: SPRING_PRESS, opacity: FADE } : { duration: 0.14, ease: EASE_IN }}
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="relative size-2.5 text-primary-foreground"
      >
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : on ? DRAW : { duration: 0.1 }}
        />
      </svg>
    </span>
  );
}

/**
 * A poll you answer with one tap. Your pick's ring fills and draws a check,
 * your bar fills first and the rest follow in a wave, each percentage slides
 * in and counts up, and the vote total ticks over. Picking another option
 * moves every bar at once.
 */
export function PollVote({
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  labels,
  className,
}: PollVoteProps) {
  const t = useMessages("PollVote", pollVoteMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const value = valueProp === undefined ? internal : valueProp;
  const voted = value !== null;

  // Remember the vote before this one: a first vote fills in a wave, a
  // moved vote shifts every bar together.
  const [last, setLast] = useState(value);
  const [from, setFrom] = useState<string | null>(value);
  if (last !== value) {
    setFrom(last);
    setLast(value);
  }
  const moved = from !== null && voted;

  const base = options.reduce((sum, option) => sum + option.votes, 0);
  const total = base + (voted ? 1 : 0);
  const share = (option: PollOption) =>
    total === 0 ? 0 : ((option.votes + (option.id === value ? 1 : 0)) / total) * 100;
  const chosen = options.find((option) => option.id === value);
  const chosenIndex = options.findIndex((option) => option.id === value);

  return (
    <fieldset aria-label={t("poll")} className={cn("flex w-full max-w-xs min-w-0 flex-col gap-2", className)}>
      {options.map((option, index) => {
        const mine = option.id === value;
        const percent = voted ? share(option) : 0;
        // Your row leads; the others follow in order.
        const order = mine ? 0 : index < chosenIndex ? index + 1 : index;
        const delay = reduce || moved || !voted ? 0 : order * STAGGER;
        return (
          <motion.button
            key={option.id}
            type="button"
            aria-pressed={mine}
            aria-label={voted ? t("percent", { label: option.label, percent: Math.round(percent) }) : option.label}
            whileTap={reduce || mine ? undefined : { scale: 0.98 }}
            transition={SPRING_PRESS}
            onClick={() => {
              if (mine) return;
              if (valueProp === undefined) setInternal(option.id);
              onValueChange?.(option.id);
            }}
            className={cn(
              "relative isolate flex h-10 items-center justify-between gap-3 overflow-hidden rounded-xl border px-3 text-left text-sm transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              mine ? "border-primary/40 font-medium text-foreground" : "border-border text-foreground",
              !voted && "hover:bg-muted/60",
            )}
          >
            {/* The bar: a full-width layer scaled from the left to its share. */}
            <motion.span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 -z-10 origin-left transition-colors duration-200",
                mine ? "bg-primary/15" : "bg-muted",
              )}
              initial={false}
              animate={{ scaleX: percent / 100 }}
              transition={reduce ? { duration: 0 } : voted ? { ...SPRING_LAYOUT, delay } : DRAIN}
            />
            <span className="flex min-w-0 items-center gap-2.5">
              <Mark on={mine} reduce={reduce} />
              <span className="truncate">{option.label}</span>
            </span>
            {/* The share slides in from the right as it starts counting. */}
            <motion.span
              aria-hidden="true"
              className={cn("shrink-0", mine ? "text-primary" : "text-muted-foreground")}
              initial={false}
              animate={{ opacity: voted ? 1 : 0, x: voted || reduce ? 0 : 6 }}
              transition={voted ? { ...FADE, delay } : { duration: 0.14, ease: EASE_IN }}
            >
              <Count value={percent} delay={delay} reduce={reduce} format={(current) => `${current}%`} />
            </motion.span>
          </motion.button>
        );
      })}
      <span className="px-1 text-xs text-muted-foreground">
        <Count value={total} delay={0} reduce={reduce} format={(count) => t("votes", { count })} />
      </span>
      <span aria-live="polite" className="sr-only">
        {chosen ? t("voted", { label: chosen.label }) : ""}
      </span>
    </fieldset>
  );
}
