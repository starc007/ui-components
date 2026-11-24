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
import { EASE_IN, EASE_IN_OUT, EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { selectSound } from "@/lib/sounds/select";
import { tapSound } from "@/lib/sounds/tap";
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
  /** Play a tap on refresh and a crisp select once updated. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

// Spins at least this long, so a quick refresh still reads as one.
const REFRESHING_MS = 1100;
const UPDATED_MS = 1600;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE = { duration: 0.16, ease: EASE_OUT } as const;
const DRAW = { duration: 0.28, ease: EASE_OUT, delay: 0.06 } as const;
// A short pull back before it goes, like winding a cord.
const WIND = { angle: -40, duration: 0.18 } as const;
// The first turn speeds up from rest; after that it turns evenly.
const SPIN_UP = { duration: 0.5, ease: EASE_IN } as const;
const TURN_SECONDS = 0.6;
// The spin coasts to a stop and lands upright.
const SETTLE = { duration: 0.65, ease: EASE_OUT } as const;
// While it works the arc breathes, long and short, like a spinner.
const BREATHE = { duration: 1.1, ease: EASE_IN_OUT, repeat: Number.POSITIVE_INFINITY } as const;

/**
 * A refresh that finishes cleanly. Pressing winds the arrows back, then
 * they spin up from rest; while it works the arrowhead tucks away and the
 * arc breathes like a spinner. On finish the spin coasts to land upright,
 * the arc closes and the arrowhead clicks back in, then a check takes over
 * as Refresh morphs to Refreshing and Updated.
 */
export function RefreshButton({
  onRefresh,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: RefreshButtonProps) {
  const t = useMessages("RefreshButton", refreshButtonMessages, labels);
  const playStart = useSound(tapSound, { enabled: sound });
  const playUpdated = useSound(selectSound, { enabled: sound });
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  const rotate = useMotionValue(0);
  const spin = useRef<AnimationPlaybackControls | null>(null);

  // Driven from the phase, so a parent re-render never restarts the spin.
  useEffect(() => {
    if (phase === "refreshing" && !reduce) {
      let cancelled = false;
      const run = async () => {
        spin.current = animate(rotate, WIND.angle, { duration: WIND.duration, ease: EASE_OUT });
        await spin.current;
        if (cancelled) return;
        spin.current = animate(rotate, 360, SPIN_UP);
        await spin.current;
        if (cancelled) return;
        spin.current = animate(rotate, [360, 720], {
          duration: TURN_SECONDS,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        });
      };
      void run();
      return () => {
        cancelled = true;
        spin.current?.stop();
      };
    }
    if (phase === "settling") {
      if (reduce) {
        setPhase("updated");
        return;
      }
      // At least half a turn more, so the stop always reads as coasting.
      const target = Math.ceil((rotate.get() + 180) / 360) * 360;
      const controls = animate(rotate, target, SETTLE);
      controls.then(() => setPhase("updated"));
      return () => controls.stop();
    }
    if (phase === "updated") {
      playUpdated();
      const id = setTimeout(() => {
        rotate.set(0);
        setPhase("idle");
      }, UPDATED_MS);
      return () => clearTimeout(id);
    }
  }, [phase, reduce, rotate, playUpdated]);

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
  const working = phase === "refreshing" && !reduce;
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
        playStart();
        void refresh();
      }}
      className={cn(
        "inline-flex h-9 items-center rounded-full border pr-2.5 pl-3 text-sm font-medium transition-colors duration-200",
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
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.6, transition: EXIT }}
              transition={reduce ? FADE : { scale: SPRING_PRESS, opacity: FADE }}
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
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.6, transition: EXIT }}
              transition={reduce ? FADE : { scale: SPRING_PRESS, opacity: FADE }}
            >
              <motion.path
                d="M21 12a9 9 0 1 1-2.64-6.36L21 8"
                initial={false}
                animate={working ? { pathLength: [0.9, 0.3, 0.9] } : { pathLength: 1 }}
                transition={working ? { ...BREATHE, delay: WIND.duration } : { duration: 0.3, ease: EASE_OUT }}
              />
              {/* The arrowhead tucks away while it spins and clicks back in at the end. */}
              <motion.path
                d="M21 3v5h-5"
                style={{ transformBox: "fill-box", originX: 1, originY: 1 }}
                initial={false}
                animate={working ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
                transition={
                  working
                    ? { duration: 0.14, ease: EASE_IN, delay: WIND.duration }
                    : { scale: { ...SPRING_PRESS, delay: 0.3 }, opacity: { ...FADE, delay: 0.3 } }
                }
              />
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
