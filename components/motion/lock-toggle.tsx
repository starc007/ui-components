"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const lockToggleMessages = {
  lock: "Lock",
  locked: "Locked",
  unlocked: "Unlocked",
};

export type LockToggleMessages = typeof lockToggleMessages;

export interface LockToggleProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  locked?: boolean;
  defaultLocked?: boolean;
  onLockedChange?: (locked: boolean) => void;
  /** Show Locked / Unlocked next to the padlock. */
  showLabel?: boolean;
  labels?: Partial<LockToggleMessages>;
}

// The shackle lifts clear of the body first, then swings open on its right
// leg; closing swings it back over the body and drops it in.
const LIFT = -3;
const SWING = -32;
const MOVE = { duration: 0.42, ease: EASE_OUT } as const;

/**
 * A padlock toggle. Unlocking lifts the shackle out of the body and swings
 * it open on its right leg; locking swings it back and drops it home, while
 * the label morphs between Locked and Unlocked.
 */
export function LockToggle({
  locked: lockedProp,
  defaultLocked = true,
  onLockedChange,
  showLabel = true,
  labels,
  className,
  onClick,
  ...rest
}: LockToggleProps) {
  const t = useMessages("LockToggle", lockToggleMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultLocked);
  const locked = lockedProp ?? internal;

  const shackle = reduce
    ? { y: 0, rotate: locked ? 0 : SWING }
    : locked
      ? { y: [LIFT, LIFT, 0], rotate: [SWING, 0, 0] }
      : { y: [0, LIFT, LIFT], rotate: [0, 0, SWING] };

  return (
    <motion.button
      type="button"
      aria-pressed={locked}
      aria-label={t("lock")}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !locked;
        if (lockedProp === undefined) setInternal(next);
        onLockedChange?.(next);
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-full border text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        showLabel ? "px-2" : "w-8 justify-center",
        locked
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
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
        className="size-4 shrink-0 overflow-visible"
      >
        <motion.path
          d="M8 11V7a4 4 0 0 1 8 0v4"
          // Hinged on the right leg, where it meets the body.
          style={{ transformOrigin: "16px 11px", transformBox: "view-box" }}
          initial={false}
          animate={shackle}
          transition={reduce ? { duration: 0 } : { ...MOVE, times: [0, 0.4, 1] }}
        />
        <rect x="4.5" y="11" width="15" height="10" rx="2" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
      {showLabel ? (
        // The button's name stays "Lock"; the state is aria-pressed.
        <span aria-hidden="true" className="px-1.5">
          <TextMorph>{locked ? t("locked") : t("unlocked")}</TextMorph>
        </span>
      ) : null}
    </motion.button>
  );
}
