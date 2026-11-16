"use client";

import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const sendButtonMessages = {
  send: "Send",
  sending: "Sending",
  sent: "Sent",
};

export type SendButtonMessages = typeof sendButtonMessages;

type Phase = "idle" | "sending" | "sent";

export interface SendButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  /** Runs the send. Return a promise to keep Sending up until it settles. */
  onSend?: () => unknown;
  labels?: Partial<SendButtonMessages>;
}

// Sending shows at least this long, so the flight always reads.
const SENDING_MS = 900;
const SENT_MS = 2000;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
const DRAW = { duration: 0.3, ease: EASE_OUT, delay: 0.06 } as const;
// The plane accelerates away, the way a thrown thing leaves the hand.
const FLIGHT = { duration: 0.5, ease: EASE_IN } as const;
// One turn per 0.8s, evenly: a spinner should never ease.
const SPIN = { duration: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;

const SWAP = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(3px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(3px)", transition: EXIT },
  transition: { ...SPRING_SWAP, opacity: FADE_IN },
};

// Three specks left behind along the flight path, fading in turn.
const TRAIL = [
  { x: 2, y: -2, delay: 0.06 },
  { x: 6, y: -6, delay: 0.12 },
  { x: 10, y: -10, delay: 0.18 },
];

/**
 * A send that you can watch go. The paper plane takes off through the top
 * right of the pill and leaves a short trail, a spinner holds while it
 * sends, then a check draws in as Send morphs to Sending and Sent.
 */
export function SendButton({ onSend, labels, className, onClick, ...rest }: SendButtonProps) {
  const t = useMessages("SendButton", sendButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  // Counts sends, so each one replays the trail.
  const [flights, setFlights] = useState(0);

  useEffect(() => {
    if (phase !== "sent") return;
    const id = setTimeout(() => setPhase("idle"), SENT_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const send = async () => {
    setPhase("sending");
    setFlights((count) => count + 1);
    const started = Date.now();
    try {
      await onSend?.();
    } catch {
      setPhase("idle");
      return;
    }
    const wait = Math.max(0, SENDING_MS - (Date.now() - started));
    setTimeout(() => setPhase("sent"), wait);
  };

  const instant = { duration: 0 };
  const swap = reduce ? { ...SWAP, initial: { opacity: 0 }, exit: { opacity: 0, transition: EXIT } } : SWAP;

  return (
    <motion.button
      type="button"
      aria-busy={phase === "sending" || undefined}
      whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || phase !== "idle") return;
        void send();
      }}
      className={cn(
        // The pill clips the plane, so it leaves through the edge.
        "relative inline-flex h-8 items-center overflow-hidden rounded-full border px-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        phase === "sent"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...rest}
    >
      <span className="relative inline-flex size-4 shrink-0">
        {phase === "sending" && !reduce ? (
          <span key={flights} aria-hidden="true" className="pointer-events-none absolute inset-0">
            {TRAIL.map((speck) => (
              <motion.span
                key={speck.x}
                className="absolute top-1/2 left-1/2 size-[3px] rounded-full bg-current"
                style={{ x: speck.x, y: speck.y, translate: "-50% -50%" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: speck.delay }}
              />
            ))}
          </span>
        ) : null}
        <AnimatePresence initial={false}>
          {phase === "idle" ? (
            <motion.svg
              key="idle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              initial={swap.initial}
              animate={swap.animate}
              // Takes off up and to the right, tipping its nose as it climbs.
              exit={reduce ? swap.exit : { x: 26, y: -26, rotate: -10, opacity: 0, transition: FLIGHT }}
              transition={swap.transition}
            >
              <path d="M21 3L10.5 13.5" />
              <path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3z" />
            </motion.svg>
          ) : phase === "sending" ? (
            <motion.svg
              key="sending"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              initial={swap.initial}
              animate={swap.animate}
              exit={swap.exit}
              // Waits for the plane to clear the pill before it shows.
              transition={{ ...swap.transition, delay: reduce ? 0 : 0.3 }}
            >
              <motion.g animate={reduce ? undefined : { rotate: 360 }} transition={SPIN} style={{ originX: "12px", originY: "12px" }}>
                <circle cx="12" cy="12" r="8" className="opacity-30" />
                <path d="M12 4a8 8 0 0 1 8 8" />
              </motion.g>
            </motion.svg>
          ) : (
            <motion.svg
              key="sent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              {...swap}
            >
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? instant : DRAW}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span className="px-1.5">
        <TextMorph>{t(phase === "idle" ? "send" : phase)}</TextMorph>
      </span>
    </motion.button>
  );
}
