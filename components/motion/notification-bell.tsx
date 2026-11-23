"use client";

import { AnimatePresence, type HTMLMotionProps, motion, type Transition, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_IN, EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const notificationBellMessages = {
  notifications: "Notifications",
  unread: "Notifications, {count} unread",
};

export type NotificationBellMessages = typeof notificationBellMessages;

export interface NotificationBellProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  /** Unread count. */
  count?: number;
  defaultCount?: number;
  /** Called with 0 when the bell is pressed, and with any count you set. */
  onCountChange?: (count: number) => void;
  /** Counts above this show as "9+". */
  max?: number;
  labels?: Partial<NotificationBellMessages>;
}

// A bell's swing: wide at first, each pass a little smaller, settling at rest.
const SWING = [0, 18, -14, 10, -6, 3, 0];
// The clapper lags the bell, so it swings the other way.
const CLAPPER = [0, -2.5, 2.2, -1.4, 0.8, 0];
const RING = { duration: 0.8, ease: EASE_OUT } as const;
// Reading them: a small nod, as if the bell were acknowledged.
const NOD = [0, -7, 3, 0];
const NOD_TIMING = { duration: 0.4, ease: EASE_OUT } as const;
// A later notification bumps the badge that is already there.
const BUMP = { duration: 0.32, ease: EASE_OUT } as const;
// Ring waves pulse out on both sides as it swings.
const WAVE: Transition = { duration: 0.6, ease: EASE_OUT, times: [0, 0.35, 1] };
const EXIT = { duration: 0.18, ease: EASE_IN } as const;

/**
 * A bell for unread notifications. Each new one swings the bell from its
 * top while the clapper lags behind and ring waves pulse out on both sides;
 * the badge pops in from the bell's shoulder, or bumps and rolls its count
 * if it is already showing. Pressing it clears the count: the badge shrinks
 * back into the bell and the bell gives a small nod.
 */
export function NotificationBell({
  count: countProp,
  defaultCount = 0,
  onCountChange,
  max = 9,
  labels,
  className,
  onClick,
  ...rest
}: NotificationBellProps) {
  const t = useMessages("NotificationBell", notificationBellMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultCount);
  const count = countProp ?? internal;

  // React to every change of count, whoever made it. Detected during
  // render, so the motion starts in the same commit as the new number.
  const [seen, setSeen] = useState(count);
  const [rings, setRings] = useState(0);
  const [bumps, setBumps] = useState(0);
  const [nods, setNods] = useState(0);
  if (seen !== count) {
    if (count > seen) {
      setRings((value) => value + 1);
      if (seen > 0) setBumps((value) => value + 1);
    } else if (count === 0) {
      setNods((value) => value + 1);
    }
    setSeen(count);
  }

  // Controls, not imperative animate(), so the components' own origins
  // (the bell's top) apply to the swing.
  const bell = useAnimationControls();
  const clapper = useAnimationControls();
  const badge = useAnimationControls();

  useEffect(() => {
    if (rings === 0 || reduce) return;
    bell.start({ rotate: SWING, transition: RING });
    clapper.start({ x: CLAPPER, transition: RING });
    return () => {
      bell.stop();
      clapper.stop();
    };
  }, [rings, reduce, bell, clapper]);

  useEffect(() => {
    if (bumps === 0 || reduce) return;
    badge.start({ scale: [1, 1.25, 1], transition: BUMP });
    return () => badge.stop();
  }, [bumps, reduce, badge]);

  useEffect(() => {
    if (nods === 0 || reduce) return;
    bell.start({ rotate: NOD, transition: NOD_TIMING });
    return () => bell.stop();
  }, [nods, reduce, bell]);

  const shown = count > max ? `${max}+` : String(count);

  return (
    <motion.button
      type="button"
      aria-label={count > 0 ? t("unread", { count }) : t("notifications")}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || count === 0) return;
        if (countProp === undefined) setInternal(0);
        onCountChange?.(0);
      }}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
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
        className="size-5 overflow-visible"
      >
        {/* The bell hangs from the middle of its top edge, so it swings from there. */}
        <motion.g animate={bell} style={{ transformBox: "fill-box", originX: 0.5, originY: 0 }}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <motion.path animate={clapper} d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.g>
        {/* Ring waves, one each side, pulsing out as it swings. */}
        {rings > 0 && !reduce ? (
          <g key={rings}>
            <motion.path
              d="M3.5 3.5A9 9 0 0 0 1.5 9"
              initial={{ pathLength: 0, opacity: 0, x: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.8, 0], x: -1.5 }}
              transition={{ ...WAVE, pathLength: { duration: 0.3, ease: EASE_OUT } }}
            />
            <motion.path
              d="M20.5 3.5A9 9 0 0 1 22.5 9"
              initial={{ pathLength: 0, opacity: 0, x: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.8, 0], x: 1.5 }}
              transition={{ ...WAVE, pathLength: { duration: 0.3, ease: EASE_OUT } }}
            />
          </g>
        ) : null}
      </svg>
      <AnimatePresence initial={false}>
        {count > 0 ? (
          <motion.span
            key="badge"
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 origin-bottom-left"
            // Pops out of the bell's shoulder, and shrinks back into it when read.
            initial={reduce ? { opacity: 0 } : { scale: 0, x: -6, y: 6, opacity: 0 }}
            animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: EXIT } : { scale: 0, x: -6, y: 6, opacity: 0, transition: EXIT }}
            transition={{ ...SPRING_PRESS, opacity: { duration: 0.12, ease: EASE_OUT } }}
          >
            <motion.span
              animate={badge}
              className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] leading-none font-medium text-white tabular-nums ring-2 ring-background"
            >
              <DigitSwap value={shown} direction="up" />
            </motion.span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
