"use client";

import { AnimatePresence, type HTMLMotionProps, motion, type Transition, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { navigateSound } from "@/lib/sounds/navigate";
import { successSound } from "@/lib/sounds/success";
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
  /** Play a swish as the plane leaves and a success chime once sent. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

// Sending shows at least this long, so the flight always reads.
const SENDING_MS = 1000;
const SENT_MS = 1800;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE = { duration: 0.16, ease: EASE_OUT } as const;
const DRAW = { duration: 0.28, ease: EASE_OUT, delay: 0.08 } as const;
// A short wind-up back and down, then away, accelerating like a throw.
const LAUNCH: Transition = { duration: 0.55, times: [0, 0.22, 1], ease: [EASE_OUT, EASE_IN] };
// The contrail starts as the plane leaves the wind-up and accelerates with
// it, then erases from its tail.
const TRAIL: Transition = { duration: 0.8, times: [0, 0.5, 1], ease: [EASE_IN, EASE_OUT], delay: 0.14 };
// The dots bounce in a wave while it sends.
const BOUNCE: Transition = { duration: 0.6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.1 };
const DOTS = [0, 1, 2];

/**
 * A send that you can watch go. The paper plane winds up and takes off
 * through the top right of the pill, drawing a contrail that erases from its
 * tail; three dots bounce while it sends; a check pops in for Sent; then the
 * plane flies back in from the bottom left, as if it had looped around.
 */
export function SendButton({
  onSend,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: SendButtonProps) {
  const t = useMessages("SendButton", sendButtonMessages, labels);
  const playSend = useSound(navigateSound, { enabled: sound });
  const playSent = useSound(successSound, { enabled: sound });
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  // Counts sends, so each one replays the contrail.
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
    setTimeout(() => {
      playSent();
      setPhase("sent");
    }, wait);
  };

  const instant = { duration: 0 };
  const fadeOnly = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: EXIT } };

  return (
    <motion.button
      type="button"
      aria-busy={phase === "sending" || undefined}
      whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || phase !== "idle") return;
        playSend();
        void send();
      }}
      className={cn(
        // The pill clips the plane, so it leaves and returns through the edge.
        "relative inline-flex h-9 items-center overflow-hidden rounded-full border pr-2.5 pl-3 text-sm font-medium transition-colors duration-200",
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
        {/* The contrail, from the plane's tail up and out of the pill. */}
        {flights > 0 && !reduce ? (
          <svg
            key={flights}
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 overflow-visible"
          >
            <motion.path
              d="M14 26 Q 22 22 40 4"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0.5 }}
              animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1], opacity: [0.5, 0.5, 0] }}
              transition={TRAIL}
            />
          </svg>
        ) : null}
        <AnimatePresence initial={false}>
          {phase === "idle" ? (
            <motion.svg
              key="plane"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              // Comes back in from the bottom left, as if it looped around.
              initial={reduce ? { opacity: 0 } : { x: -18, y: 18, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              exit={
                reduce
                  ? { opacity: 0, transition: EXIT }
                  : { x: [0, -2, 30], y: [0, 2, -30], rotate: [0, -12, 0], opacity: [1, 1, 0], transition: LAUNCH }
              }
              transition={reduce ? FADE : { ...SPRING_SWAP, opacity: FADE }}
            >
              <path d="M21 3L10.5 13.5" />
              <path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3z" />
            </motion.svg>
          ) : phase === "sending" ? (
            <motion.span
              key="dots"
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center gap-[2px]"
              {...fadeOnly}
              // Waits for the plane to clear the pill.
              transition={{ ...FADE, delay: reduce ? 0 : 0.32 }}
            >
              {DOTS.map((dot) => (
                <motion.span
                  key={dot}
                  className="size-[3px] rounded-full bg-current"
                  animate={reduce ? undefined : { y: [0, -3, 0] }}
                  transition={{ ...BOUNCE, delay: 0.32 + dot * 0.12 }}
                />
              ))}
            </motion.span>
          ) : (
            <motion.svg
              key="check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.6, transition: EXIT }}
              transition={reduce ? FADE : { scale: SPRING_PRESS, opacity: FADE }}
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
