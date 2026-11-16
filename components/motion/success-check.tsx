"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const successCheckMessages = {
  success: "Success",
};

export type SuccessCheckMessages = typeof successCheckMessages;

export interface SuccessCheckProps {
  /** Pixel size of the icon. */
  size?: number;
  /** Change it to play the animation again. */
  replayKey?: string | number;
  /** Hide the icon from screen readers when nearby text already says it. */
  decorative?: boolean;
  labels?: Partial<SuccessCheckMessages>;
  className?: string;
}

const CIRCLE = { duration: 0.32, ease: EASE_OUT } as const;
const CHECK = { duration: 0.22, ease: EASE_OUT, delay: 0.22 } as const;
const RING = { duration: 0.5, ease: EASE_OUT, delay: 0.3 } as const;

/**
 * A circle that draws itself, a check that follows, and a ring that fades
 * out from the edge. It plays on mount and again whenever `replayKey` changes.
 */
export function SuccessCheck({
  size = 40,
  replayKey,
  decorative = false,
  labels,
  className,
}: SuccessCheckProps) {
  const t = useMessages("SuccessCheck", successCheckMessages, labels);
  const reduce = useReducedMotion();
  const fade = { opacity: 0 };
  const box = cn("relative inline-flex text-primary", className);
  const style = { width: size, height: size };

  const drawing = (
    <>
      {reduce ? null : (
        <motion.span
          key={`ring-${replayKey}`}
          className="absolute inset-0 rounded-full border-2 border-current"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={RING}
        />
      )}
      <svg key={replayKey} viewBox="0 0 40 40" fill="none" className="size-full" aria-hidden="true">
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          // Start the stroke at 12 o'clock.
          className="origin-center -rotate-90 [transform-box:fill-box]"
          initial={reduce ? fade : { pathLength: 0 }}
          animate={reduce ? { opacity: 1 } : { pathLength: 1 }}
          transition={CIRCLE}
        />
        <motion.path
          d="M12.5 20.5l5 5 10-11"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? fade : { pathLength: 0 }}
          animate={reduce ? { opacity: 1 } : { pathLength: 1 }}
          transition={reduce ? { duration: 0.2 } : CHECK}
        />
      </svg>
    </>
  );

  return decorative ? (
    <span aria-hidden="true" className={box} style={style}>
      {drawing}
    </span>
  ) : (
    <span role="img" aria-label={t("success")} className={box} style={style}>
      {drawing}
    </span>
  );
}
