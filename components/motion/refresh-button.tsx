"use client";

import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  type HTMLMotionProps,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const refreshButtonMessages = {
  refresh: "Refresh",
  refreshing: "Refreshing",
  updated: "Updated",
};

export type RefreshButtonMessages = typeof refreshButtonMessages;

type Phase = "idle" | "refreshing" | "settling" | "updated";

export interface RefreshButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  /** Runs the refresh. Return a promise to keep spinning until it settles. */
  onRefresh?: () => unknown;
  labels?: Partial<RefreshButtonMessages>;
}

// Spins at least this long, so a quick refresh still reads as one.
const REFRESHING_MS = 1000;
const UPDATED_MS = 1800;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
const DRAW = { duration: 0.3, ease: EASE_OUT, delay: 0.04 } as const;
// One turn per 0.7s while working.
const TURN_SECONDS = 0.7;
// The spin eases out over one more turn and lands upright.
const SETTLE = { duration: 0.6, ease: EASE_OUT } as const;

const SWAP = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(3px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(3px)", transition: EXIT },
  transition: { ...SPRING_SWAP, opacity: FADE_IN },
};

/**
 * A refresh that finishes cleanly. The arrows spin while it works, then
 * ease to a stop on a full turn instead of freezing mid-spin, and hand over
 * to a check as Refresh morphs to Refreshing and Updated.
 */
export function RefreshButton({ onRefresh, labels, className, onClick, ...rest }: RefreshButtonProps) {
  const t = useMessages("RefreshButton", refreshButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  const rotate = useMotionValue(0);
  const spin = useRef<AnimationPlaybackControls | null>(null);

  // Spin while refreshing; on finish, coast to the next full turn, then
  // show the check. Driven from the phase so a parent re-render never
  // restarts the spin.
  useEffect(() => {
    if (phase === "refreshing" && !reduce) {
      const from = rotate.get();
      spin.current = animate(rotate, [from, from + 360], {
        duration: TURN_SECONDS,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      });
      return () => spin.current?.stop();
    }
    if (phase === "settling") {
      spin.current?.stop();
      if (reduce) {
        setPhase("updated");
        return;
      }
      const target = (Math.ceil(rotate.get() / 360) + 1) * 360;
      const controls = animate(rotate, target, SETTLE);
      controls.then(() => setPhase("updated"));
      return () => controls.stop();
    }
    if (phase === "updated") {
      const id = setTimeout(() => {
        rotate.set(0);
        setPhase("idle");
      }, UPDATED_MS);
      return () => clearTimeout(id);
    }
  }, [phase, reduce, rotate]);

  const refresh = async () => {
    setPhase("refreshing");
    const started = Date.now();
    try {
      await onRefresh?.();
    } catch {
      setPhase("idle");
      return;
    }
    const wait = Math.max(0, REFRESHING_MS - (Date.now() - started));
    setTimeout(() => setPhase("settling"), wait);
  };

  const instant = { duration: 0 };
  const swap = reduce ? { ...SWAP, initial: { opacity: 0 }, exit: { opacity: 0, transition: EXIT } } : SWAP;
  const label = phase === "idle" ? "refresh" : phase === "updated" ? "updated" : "refreshing";

  return (
    <motion.button
      type="button"
      aria-busy={phase === "refreshing" || phase === "settling" || undefined}
      whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || phase !== "idle") return;
        void refresh();
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        phase === "idle" && "border-border text-foreground hover:bg-muted/60",
        phase === "updated" && "border-primary/30 bg-primary/10 text-primary",
        (phase === "refreshing" || phase === "settling") && "border-border text-muted-foreground",
        className,
      )}
      {...rest}
    >
      <span className="relative inline-flex size-4 shrink-0">
        <AnimatePresence initial={false}>
          {phase === "updated" ? (
            <motion.svg
              key="updated"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              {...swap}
            >
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? instant : DRAW}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="arrows"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              style={{ rotate }}
              {...swap}
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
              <path d="M21 3v5h-5" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span className="px-1.5">
        <TextMorph>{t(label)}</TextMorph>
      </span>
    </motion.button>
  );
}
