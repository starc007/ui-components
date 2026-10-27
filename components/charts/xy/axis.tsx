"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";

const FADE = { duration: 0.16, ease: EASE_OUT } as const;
const EXIT = { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } } as const;

/**
 * Value gridlines keyed by tick value: a tick that survives a rescale glides to
 * its new position, new ticks fade in where they belong, old ones fade out.
 */
export function XYGridLines({
  ticks,
  position,
  axis,
  from,
  to,
  reduce,
}: {
  ticks: readonly number[];
  position: (value: number) => number;
  /** `y` draws horizontal lines at y positions; `x` vertical lines at x positions. */
  axis: "x" | "y";
  from: number;
  to: number;
  reduce: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {ticks.map((tick) => {
        const at = { [axis]: position(tick) };
        return (
          <motion.line
            key={tick}
            {...(axis === "y" ? { x1: from, x2: to, y1: 0, y2: 0 } : { y1: from, y2: to, x1: 0, x2: 0 })}
            // Border tokens are tuned for card edges and vanish as thin rules on a plot.
            stroke="currentColor"
            strokeOpacity={tick === 0 ? 0.3 : 0.12}
            className="text-muted-foreground"
            initial={{ opacity: 0, ...at }}
            animate={{ opacity: 1, ...at }}
            exit={EXIT}
            transition={{ opacity: FADE, default: reduce ? { duration: 0 } : SPRING_LAYOUT }}
          />
        );
      })}
    </AnimatePresence>
  );
}

export function XYTickLabels({
  ticks,
  position,
  axis,
  format,
  reduce,
  offset,
}: {
  ticks: readonly number[];
  position: (value: number) => number;
  /** `y` stacks labels in a left gutter; `x` lines them up under the plot. */
  axis: "x" | "y";
  format: (value: number) => string;
  reduce: boolean;
  /** Gutter width for `y`, or the top edge of the label row for `x`, in px. */
  offset: number;
}) {
  return (
    <AnimatePresence initial={false}>
      {ticks.map((tick) => {
        const at = { [axis]: position(tick) };
        return (
          <motion.span
            key={tick}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 font-mono text-[11px] whitespace-nowrap text-muted-foreground tabular-nums"
            style={axis === "y" ? { width: offset - 8 } : { top: offset }}
            initial={{ opacity: 0, ...at }}
            animate={{ opacity: 1, ...at }}
            exit={EXIT}
            transition={{ opacity: FADE, default: reduce ? { duration: 0 } : SPRING_LAYOUT }}
          >
            <span
              className={
                axis === "y" ? "block -translate-y-1/2 text-right" : "block -translate-x-1/2"
              }
            >
              {format(tick)}
            </span>
          </motion.span>
        );
      })}
    </AnimatePresence>
  );
}
