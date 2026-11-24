"use client";

import { ArrowBigUp } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";
import { cn } from "@/lib/utils";

export const upvoteButtonMessages = {
  upvote: "Upvote",
};

export type UpvoteButtonMessages = typeof upvoteButtonMessages;

export type UpvoteButtonOrientation = "vertical" | "horizontal";

export interface UpvoteButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  voted?: boolean;
  defaultVoted?: boolean;
  onVotedChange?: (voted: boolean) => void;
  /** Votes from everyone else. The viewer's own vote is added on top. */
  count: number;
  orientation?: UpvoteButtonOrientation;
  labels?: Partial<UpvoteButtonMessages>;
  /** Play a rising snap on vote and a falling one on unvote. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

const EXIT = { duration: 0.16, ease: EASE_OUT } as const;
// The fill rises like a level and drains a little faster than it rises.
const RISE = { duration: 0.34, ease: EASE_OUT } as const;
const DRAIN = { duration: 0.24, ease: EASE_OUT } as const;
const FLOAT = { duration: 0.6, ease: EASE_OUT } as const;

// The arrow travels through its slot: a vote sends the old arrow out the top
// as the new one rises in from below; taking it back runs the other way.
const ARROW_VARIANTS = {
  enter: ({ dir, reduce }: { dir: number; reduce: boolean }) => ({
    y: reduce ? "0%" : `${dir * 110}%`,
    opacity: reduce ? 0 : 1,
  }),
  center: { y: "0%", opacity: 1 },
  exit: ({ dir, reduce }: { dir: number; reduce: boolean }) => ({
    y: reduce ? "0%" : `${-dir * 110}%`,
    opacity: reduce ? 0 : 1,
    transition: EXIT,
  }),
};

/**
 * A vote toggle where the vote rises through the button: the pill fills
 * with colour from the bottom, the arrow shoots out the top as a filled one
 * rises in behind it, a +1 floats away and the count rolls up. Taking the
 * vote back drains the fill and runs it all downward.
 */
export function UpvoteButton({
  voted: votedProp,
  defaultVoted = false,
  onVotedChange,
  count,
  orientation = "vertical",
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: UpvoteButtonProps) {
  const t = useMessages("UpvoteButton", upvoteButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultVoted);
  const voted = votedProp ?? internal;
  const playVote = useSound(toggleOnSound, { enabled: sound });
  const playUnvote = useSound(toggleOffSound, { enabled: sound });
  // Counts every toggle, so each one swaps the arrow; votes alone replay the +1.
  const [toggles, setToggles] = useState(0);
  const [votes, setVotes] = useState(0);
  const custom = { dir: voted ? 1 : -1, reduce };
  const vertical = orientation === "vertical";

  return (
    <span className="relative inline-flex">
      {/* The +1 floats above the button, outside its clipping. */}
      <AnimatePresence>
        {voted && votes > 0 && !reduce ? (
          <motion.span
            key={votes}
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 left-1/2 text-xs font-medium text-primary tabular-nums"
            style={{ translate: "-50% 0" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 1, 0], y: -18 }}
            exit={{ opacity: 0 }}
            transition={FLOAT}
          >
            +1
          </motion.span>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-pressed={voted}
        aria-label={t("upvote")}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const next = !voted;
          if (next) playVote();
          else playUnvote();
          if (votedProp === undefined) setInternal(next);
          setToggles((value) => value + 1);
          if (next) setVotes((value) => value + 1);
          onVotedChange?.(next);
        }}
        className={cn(
          "relative isolate inline-flex items-center justify-center overflow-hidden border text-sm font-medium tabular-nums transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          vertical ? "min-w-12 flex-col gap-0.5 rounded-2xl px-2.5 py-2" : "h-9 gap-1.5 rounded-full pr-3.5 pl-2.5",
          voted
            ? "border-primary text-primary-foreground"
            : "border-border text-foreground hover:bg-muted/60",
          className,
        )}
        {...rest}
      >
        {/* The fill: rises from the bottom on a vote, drains back down. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-primary"
          initial={false}
          animate={{ clipPath: voted ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
          transition={reduce ? { duration: 0 } : voted ? RISE : DRAIN}
        />
        <span aria-hidden="true" className="relative inline-flex size-[18px] overflow-hidden">
          <AnimatePresence initial={false} custom={custom}>
            <motion.span
              key={toggles}
              custom={custom}
              variants={ARROW_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING_SWAP}
              className="absolute inset-0 inline-flex"
            >
              <ArrowBigUp className={cn("size-[18px]", voted && "fill-current")} strokeWidth={2} />
            </motion.span>
          </AnimatePresence>
        </span>
        <DigitSwap value={count + (voted ? 1 : 0)} direction={voted ? "up" : "down"} />
      </motion.button>
    </span>
  );
}
