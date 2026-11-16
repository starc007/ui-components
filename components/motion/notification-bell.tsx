"use client";

import { AnimatePresence, animate, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
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
const SWING = [0, 16, -13, 9, -5, 2, 0];
// The clapper lags the bell, so it swings the other way.
const CLAPPER = [0, -2.5, 2.2, -1.4, 0.8, 0];
const RING = { duration: 0.75, ease: EASE_OUT } as const;
const EXIT = { duration: 0.16, ease: EASE_OUT } as const;

/**
 * A bell for unread notifications. Each new one swings the bell from its
 * top while the clapper lags behind, pops the badge and rolls its count.
 * Pressing it clears the count and the badge shrinks away.
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

  // Ring whenever the count goes up, whoever raised it. Detected during
  // render, so the swing starts in the same commit as the new number.
  const [seen, setSeen] = useState(count);
  const [rings, setRings] = useState(0);
  if (seen !== count) {
    if (count > seen) setRings((value) => value + 1);
    setSeen(count);
  }

  const bellRef = useRef<SVGGElement>(null);
  const clapperRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (rings === 0 || reduce) return;
    const bell = bellRef.current && animate(bellRef.current, { rotate: SWING }, RING);
    const clapper = clapperRef.current && animate(clapperRef.current, { x: CLAPPER }, RING);
    return () => {
      bell?.stop();
      clapper?.stop();
    };
  }, [rings, reduce]);

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
        "relative inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors",
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
        className="size-4 overflow-visible"
      >
        {/* The bell hangs from its top, so it swings from there. */}
        <g ref={bellRef} style={{ transformOrigin: "12px 2px", transformBox: "view-box" }}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path ref={clapperRef} d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </g>
      </svg>
      <AnimatePresence initial={false}>
        {count > 0 ? (
          <motion.span
            key="badge"
            aria-hidden="true"
            className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white tabular-nums"
            initial={{ scale: reduce ? 1 : 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0, opacity: 0, transition: EXIT }}
            transition={SPRING_PRESS}
          >
            <DigitSwap value={shown} direction="up" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
