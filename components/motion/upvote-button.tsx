"use client";

import { ChevronUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ComponentPropsWithRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const upvoteButtonMessages = {
  upvote: "Upvote",
};

export type UpvoteButtonMessages = typeof upvoteButtonMessages;

export type UpvoteButtonOrientation = "vertical" | "horizontal";

export interface UpvoteButtonProps
  extends Omit<ComponentPropsWithRef<"button">, "children" | "onChange"> {
  voted?: boolean;
  defaultVoted?: boolean;
  onVotedChange?: (voted: boolean) => void;
  /** Votes from everyone else. The viewer's own vote is added on top. */
  count: number;
  orientation?: UpvoteButtonOrientation;
  labels?: Partial<UpvoteButtonMessages>;
}

/** A vote toggle: the arrow kicks up and the count rolls to its new value. */
export function UpvoteButton({
  voted: votedProp,
  defaultVoted = false,
  onVotedChange,
  count,
  orientation = "vertical",
  labels,
  className,
  onClick,
  ...rest
}: UpvoteButtonProps) {
  const t = useMessages("UpvoteButton", upvoteButtonMessages, labels);
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(defaultVoted);
  const voted = votedProp ?? internal;
  const [presses, setPresses] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={voted}
      aria-label={t("upvote")}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !voted;
        if (votedProp === undefined) setInternal(next);
        if (next) setPresses((value) => value + 1);
        onVotedChange?.(next);
      }}
      className={cn(
        "inline-flex items-center justify-center border text-sm font-medium tabular-nums transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        orientation === "vertical"
          ? "min-w-12 flex-col gap-0.5 rounded-2xl px-2.5 py-2"
          : "h-8 gap-1 rounded-full pr-3 pl-2",
        voted
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-foreground hover:bg-muted/60",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="relative inline-flex">
        {/* On a vote, a ghost arrow keeps travelling up and fades, so the
            vote reads as a push upward. */}
        {voted && presses > 0 && !reduce ? (
          <motion.span
            key={presses}
            className="absolute inset-0 inline-flex"
            initial={{ opacity: 0.7, y: 0 }}
            animate={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
          >
            <ChevronUp className="size-4" strokeWidth={2.5} />
          </motion.span>
        ) : null}
        <motion.span
          className="inline-flex"
          initial={false}
          animate={{ y: voted && !reduce ? [4, 0] : 0 }}
          transition={SPRING_PRESS}
        >
          <ChevronUp className="size-4" strokeWidth={2.5} />
        </motion.span>
      </span>
      <DigitSwap value={count + (voted ? 1 : 0)} direction={voted ? "up" : "down"} />
    </button>
  );
}
