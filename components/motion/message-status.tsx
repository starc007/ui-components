"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
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
  /** Show the status as a word next to the ticks. */
  showLabel?: boolean;
  labels?: Partial<MessageStatusMessages>;
  className?: string;
}

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const DRAW = { duration: 0.28, ease: EASE_OUT } as const;
// One sweep of the clock hand per second while sending.
const TICK = { duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;

// The second tick sits a little to the right of the first, its short leg
// tucked behind the first tick's long one, the familiar double check.
const FIRST = "M2 12.5l4.5 4.5L16 7.5";
const SECOND = "M8.5 15.5l1.5 1.5L19.5 7.5";

/**
 * The delivery state of a sent message. A clock while it sends, a tick
 * that draws once it is sent, a second tick that slides in when it is
 * delivered, and both turning the accent colour once it is read.
 */
export function MessageStatus({ status, showLabel = false, labels, className }: MessageStatusProps) {
  const t = useMessages("MessageStatus", messageStatusMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const instant = { duration: 0 };
  const ticks = status === "delivered" || status === "read" ? 2 : status === "sent" ? 1 : 0;

  const ticksIcon = (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-4 w-[22px] shrink-0 transition-colors duration-300",
        status === "read" && "text-primary",
      )}
    >
      <AnimatePresence initial={false}>
        {status === "sending" ? (
          <motion.svg
            key="clock"
            viewBox="0 0 22 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="absolute inset-0 h-4 w-[22px]"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.6, transition: EXIT }}
            transition={SPRING_SWAP}
          >
            <circle cx="9" cy="12" r="7" />
            <motion.path
              d="M9 12V8"
              style={{ originX: "9px", originY: "12px" }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={TICK}
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="ticks"
            viewBox="0 0 22 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute inset-0 h-4 w-[22px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={EXIT}
          >
            <motion.path
              d={FIRST}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={reduce ? instant : DRAW}
            />
            {/* Delivered: the second tick slides in from behind the first and draws. */}
            <motion.path
              d={SECOND}
              initial={false}
              animate={
                ticks === 2
                  ? { pathLength: 1, opacity: 1, x: 0 }
                  : { pathLength: 0, opacity: 0, x: reduce ? 0 : -4 }
              }
              transition={reduce ? instant : { ...SPRING_SWAP, pathLength: DRAW, opacity: EXIT }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
  const box = cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className);

  // With a label the words name it; icon only, it is an image named for its status.
  return showLabel ? (
    <span className={box}>
      {ticksIcon}
      <TextMorph>{t(status)}</TextMorph>
    </span>
  ) : (
    <span role="img" aria-label={t(status)} className={box}>
      {ticksIcon}
    </span>
  );
}
