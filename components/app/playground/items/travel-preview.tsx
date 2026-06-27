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
  strobe,
  caption,
}: {
  transition: Transition;
  replayKey: number;
  /** Box position (0..1 of travel) sampled at equal time slices. Bunched dots
   *  = slow, spread = fast — makes an easing curve legible on a plain slide. */
  strobe?: number[];
  /** Plain-English meaning of the current motion (e.g. what "easeOut" does). */
  caption?: { title: string; text: string };
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-8">
      <div className="relative h-12" style={{ width: TRAVEL + 48 }}>
        {/* baseline + strobe trail of where the box sits over equal time slices */}
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-border"
          style={{ left: 24, width: TRAVEL }}
        />
        {strobe?.map((f, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length sample trail
            key={i}
            className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
            style={{ left: 24 + f * TRAVEL }}
          />
        ))}

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

      {caption ? (
        <div className="w-full max-w-sm rounded-xl border border-border bg-background px-4 py-3 text-center">
          <p className="font-mono text-xs font-medium text-foreground">
            {caption.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {caption.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
