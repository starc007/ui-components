"use client";

import { motion, useReducedMotion } from "motion/react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const messageStatusMessages = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

export type MessageStatusMessages = typeof messageStatusMessages;

export type MessageStatusValue = "sending" | "sent" | "delivered" | "read";

export interface MessageStatusProps {
  status: MessageStatusValue;
  /** Show the status as a word next to the badges. */
  showLabel?: boolean;
  labels?: Partial<MessageStatusMessages>;
  className?: string;
}

const FADE = { duration: 0.16, ease: EASE_OUT } as const;
const QUICK_OUT = { duration: 0.12, ease: EASE_IN } as const;
// While it sends the ring creeps toward full and never quite gets there.
const PROGRESS = { duration: 2.4, ease: EASE_OUT } as const;
// On send the ring closes, then the badge fills and the check draws.
const CLOSE = { duration: 0.18, ease: EASE_OUT } as const;
const FILL = { ...SPRING_PRESS, delay: 0.14 } as const;
const DRAW = { duration: 0.24, ease: EASE_OUT, delay: 0.24 } as const;
const POP = { duration: 0.34, ease: EASE_OUT } as const;
// For Read the colour lands on the back badge first, then the front.
const READ_STAGGER = 0.1;

// Badge geometry, in px: two 20px badges overlap by half when delivered.
const BADGE = 20;
const WIDTH = 30;
const CENTER = (WIDTH - BADGE) / 2;
const FRONT = WIDTH - BADGE;

const CHECK = "M6.4 10.3l2.4 2.4 4.8-5";

/** One round badge: an optional progress ring, then a filled disc with a check. */
function Badge({
  filled,
  ring,
  progress,
  read,
  delay,
  reduce,
}: {
  filled: boolean;
  ring: boolean;
  progress: number;
  read: boolean;
  delay: number;
  reduce: boolean;
}) {
  const instant = { duration: 0 };
  return (
    <motion.svg
      viewBox="0 0 20 20"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5 overflow-visible transition-colors duration-300", read ? "text-primary" : "text-muted-foreground")}
      style={{ transitionDelay: read ? `${delay}s` : "0s" }}
      initial={false}
      // Read: a small pop as the colour lands.
      animate={read && !reduce ? { scale: [1, 1.16, 1] } : { scale: 1 }}
      transition={read ? { ...POP, delay } : FADE}
    >
      {ring ? (
        <>
          {/* The track, and the ring filling around it from the top. */}
          <motion.circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            initial={false}
            animate={{ opacity: filled ? 0 : 0.25 }}
            transition={FADE}
          />
          <motion.circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            transform="rotate(-90 10 10)"
            initial={{ pathLength: 0 }}
            // Each new send restarts the ring from empty.
            animate={{ pathLength: progress === 1 ? 1 : [0, progress] }}
            transition={reduce ? instant : progress === 1 ? CLOSE : PROGRESS}
          />
        </>
      ) : null}
      <motion.g
        style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
        initial={false}
        animate={{ scale: filled || reduce ? 1 : 0, opacity: filled ? 1 : 0 }}
        transition={filled ? { scale: reduce ? instant : FILL, opacity: { ...FADE, delay: 0.14 } } : QUICK_OUT}
      >
        {/* A halo in the page colour, so overlapping badges read as a stack. */}
        <circle cx="10" cy="10" r="11.5" className="fill-background" />
        <circle cx="10" cy="10" r="9.5" fill="currentColor" />
        <motion.path
          d={CHECK}
          className="stroke-background"
          initial={false}
          animate={{ pathLength: filled ? 1 : 0 }}
          transition={reduce ? instant : filled ? DRAW : QUICK_OUT}
        />
      </motion.g>
    </motion.svg>
  );
}

/**
 * The delivery state of a sent message, as round badges. A progress ring
 * fills while it sends, then closes into a filled badge with a check for
 * Sent; a second badge slides out from behind it for Delivered; and both
 * fill with the accent colour, one after the other, when it is read.
 */
export function MessageStatus({ status, showLabel = false, labels, className }: MessageStatusProps) {
  const t = useMessages("MessageStatus", messageStatusMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const sending = status === "sending";
  const read = status === "read";
  const double = status === "delivered" || read;

  const icon = (
    <span aria-hidden="true" className="relative inline-flex h-5 shrink-0" style={{ width: WIDTH }}>
      {/* The back badge: tucked behind the front one until delivered. */}
      <motion.span
        className="absolute top-0 left-0"
        initial={false}
        animate={
          double
            ? { x: 0, scale: 1, opacity: 1 }
            : { x: reduce ? 0 : CENTER, scale: reduce ? 1 : 0.6, opacity: 0 }
        }
        transition={double ? (reduce ? FADE : { ...SPRING_SWAP, opacity: FADE }) : QUICK_OUT}
      >
        <Badge filled ring={false} progress={1} read={read} delay={0} reduce={reduce} />
      </motion.span>
      {/* The front badge: centred alone, moves aside for the second. */}
      <motion.span
        className="absolute top-0 left-0"
        initial={false}
        animate={{ x: double ? FRONT : CENTER }}
        transition={reduce ? { duration: 0 } : SPRING_SWAP}
      >
        <Badge
          filled={!sending}
          ring
          progress={sending ? 0.85 : 1}
          read={read}
          delay={READ_STAGGER}
          reduce={reduce}
        />
      </motion.span>
    </span>
  );
  const box = cn(
    "inline-flex items-center gap-1.5 text-sm transition-colors duration-300",
    read ? "text-primary" : "text-muted-foreground",
    className,
  );

  // With a label the words name it; icon only, it is an image named for its status.
  return showLabel ? (
    <span className={box}>
      {icon}
      <TextMorph>{t(status)}</TextMorph>
    </span>
  ) : (
    <span role="img" aria-label={t(status)} className={box}>
      {icon}
    </span>
  );
}
