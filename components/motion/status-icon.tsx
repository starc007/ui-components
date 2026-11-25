"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type StatusIconStatus = "idle" | "syncing" | "success" | "warning" | "error";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const statusIconMessages = {
  idle: "Idle",
  syncing: "Syncing",
  success: "Done",
  warning: "Needs attention",
  error: "Failed",
};

export type StatusIconMessages = typeof statusIconMessages;

export interface StatusIconProps extends Omit<ComponentProps<"span">, "children"> {
  /** Which state to show. The icon morphs from one state to the next. Default: "idle" */
  status?: StatusIconStatus;
  /** Width and height in px. Default: 20 */
  size?: number;
  /** Hides the icon from assistive technology, for when nearby text already says the status. Default: false */
  decorative?: boolean;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<StatusIconMessages>;
}

const COLOR: Record<StatusIconStatus, string> = {
  idle: "text-muted-foreground/60",
  syncing: "text-foreground",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-rose-500",
};

// The ring closes, then its mark draws in; a mark leaves faster than it came.
const MARK_IN = { duration: 0.24, ease: EASE_OUT, delay: 0.14 } as const;
const MARK_OUT = { duration: 0.12, ease: EASE_OUT } as const;
// While syncing, a short arc circles the ring at a constant speed.
const SPIN = { duration: 0.9, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;
const SYNC_ARC = 0.28;

/**
 * One status icon that morphs between states instead of swapping glyphs.
 * Syncing spins a short arc round the ring. On success, warning or error the
 * arc closes into the full ring in that state's colour and its mark (check,
 * exclamation, cross) draws in. Idle is a quiet dashed ring.
 */
export function StatusIcon({
  status = "idle",
  size = 20,
  decorative = false,
  labels,
  className,
  ...props
}: StatusIconProps) {
  const t = useMessages("statusIcon", statusIconMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const syncing = status === "syncing";
  const settled = status === "success" || status === "warning" || status === "error";

  // A mark draws while its state is shown and erases when it leaves.
  const mark = (shown: boolean) => ({
    initial: false as const,
    animate: reduce
      ? { opacity: shown ? 1 : 0 }
      : { pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 },
    transition: reduce ? { duration: 0.12 } : shown ? MARK_IN : MARK_OUT,
  });

  const frame = {
    "data-status": status,
    className: cn(
      "inline-grid shrink-0 place-items-center transition-colors duration-200",
      COLOR[status],
      className,
    ),
    style: { width: size, height: size },
    ...props,
  };

  const icon = (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-full overflow-visible">
        {/* Idle: a quiet dashed ring. */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="2 3.2"
          initial={false}
          animate={{ opacity: status === "idle" ? 1 : 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
        />
        {/* Syncing: a faint track under the moving arc. */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          initial={false}
          animate={{ opacity: syncing ? 0.14 : 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
        />
        {/* The arc that spins while syncing and closes into the ring. */}
        <motion.g
          initial={false}
          animate={syncing && !reduce ? { rotate: 360 } : { rotate: 0 }}
          transition={syncing && !reduce ? SPIN : { duration: 0 }}
          style={{ originX: "12px", originY: "12px" }}
        >
          <motion.circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            transform="rotate(-90 12 12)"
            initial={false}
            animate={{
              pathLength: settled ? 1 : SYNC_ARC,
              opacity: syncing || settled ? 1 : 0,
            }}
            transition={
              reduce
                ? { duration: 0.12 }
                : { pathLength: SPRING_LAYOUT, opacity: { duration: 0.16, ease: EASE_OUT } }
            }
          />
        </motion.g>
        {/* Success: a check. */}
        <motion.path
          d="M8 12.4l2.6 2.6L16 9.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...mark(status === "success")}
        />
        {/* Warning: an exclamation, its stem then its dot. */}
        <motion.path
          d="M12 7.6v5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          {...mark(status === "warning")}
        />
        <motion.path
          d="M12 16.2v.01"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          {...mark(status === "warning")}
        />
        {/* Error: a cross. */}
        <motion.path
          d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          {...mark(status === "error")}
        />
      </svg>
  );

  return decorative ? (
    <span aria-hidden="true" {...frame}>
      {icon}
    </span>
  ) : (
    <span role="img" aria-label={t(status)} {...frame}>
      {icon}
    </span>
  );
}
