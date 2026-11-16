"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const pollVoteMessages = {
  poll: "Poll",
  percent: "{label}, {percent}%",
  voted: "You voted for {label}",
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

// The bars fill top to bottom, a beat apart, so the result reads as a wave.
const STAGGER = 0.07;
const COUNT = { duration: 0.7, ease: EASE_OUT } as const;
const DRAW = { duration: 0.3, ease: EASE_OUT } as const;

/** A percentage that counts up (or down) to its value. */
function Percent({ value, delay, reduce }: { value: number; delay: number; reduce: boolean }) {
  const shown = useMotionValue(value);
  const text = useTransform(shown, (current) => `${Math.round(current)}%`);
  useEffect(() => {
    const controls = animate(shown, value, reduce ? { duration: 0 } : { ...COUNT, delay });
    return () => controls.stop();
  }, [value, delay, reduce, shown]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/**
 * A poll you answer with one tap. Voting fills every bar to its share in a
 * wave from the top, counts each percentage up, and draws a check beside
 * your pick. Picking another option moves your vote.
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

  const total = options.reduce((sum, option) => sum + option.votes, 0) + (voted ? 1 : 0);
  const share = (option: PollOption) =>
    total === 0 ? 0 : ((option.votes + (option.id === value ? 1 : 0)) / total) * 100;
  const chosen = options.find((option) => option.id === value);

  return (
    <fieldset aria-label={t("poll")} className={cn("flex w-full max-w-xs min-w-0 flex-col gap-2", className)}>
      {options.map((option, index) => {
        const mine = option.id === value;
        const percent = voted ? share(option) : 0;
        const delay = reduce ? 0 : index * STAGGER;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={mine}
            aria-label={voted ? t("percent", { label: option.label, percent: Math.round(percent) }) : option.label}
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
              className={cn("absolute inset-0 -z-10 origin-left", mine ? "bg-primary/15" : "bg-muted")}
              initial={false}
              animate={{ scaleX: percent / 100 }}
              transition={reduce ? { duration: 0 } : { ...SPRING_LAYOUT, delay }}
            />
            <span className="flex min-w-0 items-center gap-2">
              {mine ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                >
                  <motion.path
                    d="M4.5 12.5l5 5L19.5 7"
                    initial={{ pathLength: reduce ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={reduce ? { duration: 0 } : { ...DRAW, delay: delay + 0.1 }}
                  />
                </svg>
              ) : null}
              <span className="truncate">{option.label}</span>
            </span>
            <motion.span
              aria-hidden="true"
              className="shrink-0 text-muted-foreground"
              initial={false}
              animate={{ opacity: voted ? 1 : 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT, delay: voted ? delay : 0 }}
            >
              <Percent value={percent} delay={delay} reduce={reduce} />
            </motion.span>
          </button>
        );
      })}
      <span aria-live="polite" className="sr-only">
        {chosen ? t("voted", { label: chosen.label }) : ""}
      </span>
    </fieldset>
  );
}
