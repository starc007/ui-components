"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const muteToggleMessages = {
  mute: "Mute",
};

export type MuteToggleMessages = typeof muteToggleMessages;

export interface MuteToggleProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  labels?: Partial<MuteToggleMessages>;
}

const STROKE = { duration: 0.2, ease: EASE_OUT } as const;
// Each wave waits for the one before it, so sound reads as fading out (or
// spreading back) from the speaker.
const STAGGER = 0.08;

/**
 * A mute toggle. Muting wipes the sound waves out from the outside in, then
 * draws a slash across the speaker; unmuting lifts the slash and draws the
 * waves back out from the speaker.
 */
export function MuteToggle({
  muted: mutedProp,
  defaultMuted = false,
  onMutedChange,
  labels,
  className,
  onClick,
  ...rest
}: MuteToggleProps) {
  const t = useMessages("MuteToggle", muteToggleMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultMuted);
  const muted = mutedProp ?? internal;

  // Order of strokes: muting clears the outer wave, then the inner, then
  // slashes; unmuting lifts the slash, then the inner wave, then the outer.
  const at = (step: number) => (reduce ? { duration: 0 } : { ...STROKE, delay: step * STAGGER });
  const wave = (shown: boolean, step: number) => ({
    animate: { pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 },
    transition: at(step),
  });

  return (
    <motion.button
      type="button"
      aria-pressed={muted}
      aria-label={t("mute")}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !muted;
        if (mutedProp === undefined) setInternal(next);
        onMutedChange?.(next);
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors duration-200",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        muted ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4"
      >
        <path d="M11 5L6 9H3v6h3l5 4V5z" />
        <motion.path d="M15.5 8.5a5 5 0 0 1 0 7" initial={false} {...wave(!muted, 1)} />
        <motion.path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" initial={false} {...wave(!muted, muted ? 0 : 2)} />
        <motion.path
          d="M2.5 3.5l19 17"
          initial={false}
          animate={{ pathLength: muted ? 1 : 0, opacity: muted ? 1 : 0 }}
          transition={at(muted ? 2 : 0)}
        />
      </svg>
    </motion.button>
  );
}
