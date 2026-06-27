"use client";

import { motion, type Transition } from "motion/react";

const TRAVEL = 168;

/**
 * Shared subject for time/physics types: a box travels a fixed distance from a
 * dashed "start" ghost to a "target" guide. Springs visibly overshoot the line
 * before settling, so a first-timer can see what the numbers do.
 */
export function TravelPreview({
  transition,
  replayKey,
}: {
  transition: Transition;
  replayKey: number;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-12" style={{ width: TRAVEL + 48 }}>
        {/* start ghost */}
        <div className="absolute left-0 top-0 h-12 w-12 rounded-xl border border-dashed border-border" />
        <span className="absolute left-0 top-full mt-2 text-[11px] text-muted-foreground">
          start
        </span>

        {/* target guide */}
        <div
          className="absolute top-1/2 h-16 w-px -translate-y-1/2 bg-border"
          style={{ left: TRAVEL + 24 }}
        />
        <span
          className="absolute top-full mt-2 -translate-x-1/2 text-[11px] text-muted-foreground"
          style={{ left: TRAVEL + 24 }}
        >
          target
        </span>

        {/* moving box */}
        <motion.div
          key={replayKey}
          initial={{ x: 0 }}
          animate={{ x: TRAVEL }}
          transition={transition}
          className="absolute left-0 top-0 h-12 w-12 rounded-xl bg-primary"
        />
      </div>
    </div>
  );
}
