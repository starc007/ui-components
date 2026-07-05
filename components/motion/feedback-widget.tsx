"use client";

import { AlertCircle, MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, StatefulButton } from "@/components/motion/button";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Status = "idle" | "open" | "sending" | "sent" | "error";

const SUCCESS_DURATION_MS = 1600;

// The trigger grows into the panel with a slight overshoot on open, then uses
// a calmer curve on close so dismissing feels faster and less prominent.
const MORPH_OPEN_EASE = [0.34, 1.25, 0.64, 1] as const;
const MORPH_CLOSE_EASE = [0.22, 1, 0.36, 1] as const;
const MORPH_OPEN_DURATION = 0.4;
const MORPH_CLOSE_DURATION = 0.28;
const MORPH_FADE_DURATION = 0.22;
const MORPH_SLIDE = 40;
const MORPH_SCALE = 0.97;
const MORPH_BLUR = "blur(2px)";

// Celebration sprinkles that burst from the success icon.
const SPRINKLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 26,
    y: Math.sin(angle) * 26,
    color: i % 2 === 0 ? "var(--color-success)" : "var(--accent)",
  };
});

export interface FeedbackData {
  message: string;
}

export interface FeedbackWidgetProps {
  /** Called on submit. May be async; the button shows a sending state until it resolves. */
  onSubmit?: (data: FeedbackData) => void | Promise<void>;
  position?: "bottom-right" | "bottom-left";
  title?: string;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}

export function FeedbackWidget({
  onSubmit,
  position = "bottom-right",
  title = "Help us improve",
  placeholder = "Share an idea or report a bug",
  icon,
  className,
}: FeedbackWidgetProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const open = status !== "idle";
  const busy = status === "sending";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setStatus("idle");
    setMessage("");
  }, [clearCloseTimer]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (status !== "open") return;

    // Match the wallet account switcher's staged interaction: focusing while
    // the surface is still expanding makes the caret and focus state appear
    // inside a scaled panel. Arm the field once the open morph has settled.
    const timer = window.setTimeout(
      () => textareaRef.current?.focus(),
      reduce ? 0 : MORPH_OPEN_DURATION * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [status, reduce]);

  // Dismiss on escape or outside click while open (but not mid-send).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) close();
    };
    const onPointer = (e: PointerEvent) => {
      if (
        !busy &&
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, busy, close]);

  const scheduleSuccessClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(close, SUCCESS_DURATION_MS);
  };

  const submit = async () => {
    if (busy || message.trim().length === 0) return;
    setStatus("sending");
    try {
      await onSubmit?.({ message });
      setStatus("sent");
      scheduleSuccessClose();
    } catch {
      // Preserve the message so a rejected submission can be retried.
      setStatus("error");
    }
  };

  const left = position === "bottom-left";
  const contentOffset = left ? -MORPH_SLIDE : MORPH_SLIDE;
  const surfaceTransition = reduce
    ? { duration: 0 }
    : {
        layout: {
          duration: open ? MORPH_OPEN_DURATION : MORPH_CLOSE_DURATION,
          ease: open ? MORPH_OPEN_EASE : MORPH_CLOSE_EASE,
        },
        borderRadius: {
          duration: open ? MORPH_OPEN_DURATION : MORPH_CLOSE_DURATION,
          ease: open ? MORPH_OPEN_EASE : MORPH_CLOSE_EASE,
        },
      };
  const contentTransition = reduce
    ? { duration: 0 }
    : {
        opacity: {
          duration: MORPH_FADE_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        x: {
          duration: MORPH_OPEN_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        scale: {
          duration: MORPH_OPEN_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        filter: {
          duration: MORPH_FADE_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
        rotate: {
          duration: MORPH_OPEN_DURATION,
          ease: MORPH_CLOSE_EASE,
        },
      };
  const viewInitial = reduce
    ? { opacity: 0 }
    : { opacity: 0, y: 8, filter: "blur(4px)" };
  const viewAnimate = reduce
    ? {
        opacity: 1,
        transition: { duration: 0.18, ease: EASE_OUT },
      }
    : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.24, ease: EASE_OUT },
      };
  const viewExit = reduce
    ? {
        opacity: 0,
        transition: { duration: 0.14, ease: EASE_OUT },
      }
    : {
        opacity: 0,
        y: -8,
        filter: "blur(4px)",
        transition: { duration: 0.16, ease: EASE_OUT },
      };

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute bottom-4 z-30",
        left ? "left-4" : "right-4",
        className,
      )}
    >
      {/* One persistent shell grows out of the corner trigger. The shell and
          its contents use separate timing so the surface leads the reveal. */}
      <motion.div
        layout
        animate={{ borderRadius: open ? 20 : 40 }}
        transition={surfaceTransition}
        style={{ transformOrigin: left ? "bottom left" : "bottom right" }}
        className={cn(
          "pointer-events-auto absolute bottom-0 overflow-hidden border border-border bg-background text-foreground shadow-lg",
          open ? "w-[min(86vw,320px)] p-2" : "h-12 w-12 p-0",
          left ? "left-0" : "right-0",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              initial={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: contentOffset,
                      scale: MORPH_SCALE,
                      filter: MORPH_BLUR,
                    }
              }
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: contentOffset,
                      scale: MORPH_SCALE,
                      filter: MORPH_BLUR,
                    }
              }
              transition={contentTransition}
            >
              <motion.div layout="position">
                <AnimatePresence mode="popLayout" initial={false} propagate>
                  {status === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5 rounded-[20px] bg-border/60 px-4 py-6 text-center">
                        <div className="relative mb-1 flex h-12 w-12 items-center justify-center">
                          {reduce
                            ? null
                            : SPRINKLES.map((s, i) => (
                                <motion.span
                                  key={`${s.x}-${s.y}`}
                                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                  animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0.4],
                                    x: s.x,
                                    y: s.y,
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    delay: 0.18 + i * 0.02,
                                    ease: "easeOut",
                                  }}
                                  style={{ backgroundColor: s.color }}
                                  className="absolute h-1.5 w-1.5 rounded-full"
                                />
                              ))}
                          <motion.div
                            initial={reduce ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 22,
                              delay: 0.04,
                            }}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-success)"
                          >
                            <motion.svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="h-5 w-5 text-white"
                            >
                              <motion.path
                                d="M5 12.5l4.5 4.5L19 7.5"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={
                                  reduce ? { pathLength: 1 } : { pathLength: 0 }
                                }
                                animate={{ pathLength: 1 }}
                                transition={{
                                  duration: 0.35,
                                  ease: "easeOut",
                                  delay: 0.15,
                                }}
                              />
                            </motion.svg>
                          </motion.div>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Thanks!
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Your feedback helps us build something better.
                        </p>
                      </div>
                    </motion.div>
                  ) : status === "error" ? (
                    <motion.div
                      key="error"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div
                        role="alert"
                        className="rounded-[20px] bg-border/60 px-4 py-5 text-center"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                          Something went wrong
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          We couldn&apos;t send your feedback. Please try again.
                        </p>
                        <Button size="sm" onClick={submit} className="mt-4">
                          Try again
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={viewInitial}
                      animate={viewAnimate}
                      exit={viewExit}
                    >
                      <div className="min-h-[150px] rounded-[20px] bg-border/60 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-foreground">
                            {title}
                          </h3>
                          <button
                            type="button"
                            onClick={close}
                            aria-label="Close"
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={placeholder}
                          disabled={busy}
                          rows={3}
                          className="mt-2 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 md:text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2 px-1 pt-2 pb-1">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={close}
                          disabled={busy}
                          className="flex-1 bg-border text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </Button>
                        <StatefulButton
                          state={busy ? "loading" : "idle"}
                          loadingText="Sending"
                          size="md"
                          onClick={submit}
                          disabled={busy || message.trim().length === 0}
                          className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                        >
                          Submit
                        </StatefulButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              initial={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -contentOffset,
                      filter: MORPH_BLUR,
                    }
              }
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -contentOffset,
                      filter: MORPH_BLUR,
                    }
              }
              transition={contentTransition}
              onClick={() => {
                clearCloseTimer();
                setStatus("open");
              }}
              aria-label={title}
              aria-haspopup="dialog"
              whileTap={reduce ? undefined : { scale: 0.92 }}
              className={cn(
                "absolute bottom-0 flex h-12 w-12 items-center justify-center bg-transparent text-foreground",
                left ? "left-0" : "right-0",
              )}
            >
              <motion.span
                initial={
                  reduce ? false : { rotate: 45, scale: MORPH_SCALE }
                }
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 45, scale: MORPH_SCALE }}
                transition={contentTransition}
                className="grid h-5 w-5 shrink-0 place-items-center [&>svg]:h-full [&>svg]:w-full"
              >
                {icon ?? <MessageSquare className="h-5 w-5" />}
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
