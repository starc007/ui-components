"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import {
  forwardRef,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import {
  capturePointer,
  releasePointer,
  TOUCH_GESTURE_CLASS,
} from "@/lib/touch";
import { cn } from "@/lib/utils";

export interface HoldActionButtonProps extends Omit<
  HTMLMotionProps<"button">,
  | "children"
  | "type"
  | "onClick"
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerLeave"
  | "onPointerMove"
  | "onKeyDown"
  | "onKeyUp"
> {
  children: ReactNode;
  type?: "vertical" | "horizontal";
  holdingLabel?: ReactNode;
  completeLabel?: ReactNode;
  holdDuration?: number;
  onHoldComplete?: () => void;
  fillClassName?: string;
  labelClassName?: string;
}

export const HoldActionButton = forwardRef<
  HTMLButtonElement,
  HoldActionButtonProps
>(function HoldActionButton(
  {
    children,
    type = "vertical",
    holdingLabel = "Keep holding",
    completeLabel = "Done",
    holdDuration = 1600,
    onHoldComplete,
    fillClassName,
    labelClassName,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const completedRef = useRef(false);
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startHold = () => {
    if (disabled || holding) return;
    completedRef.current = false;
    setCompleted(false);
    setHolding(true);
  };

  const cancelHold = () => {
    setHolding(false);
    setCompleted(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    // Start first: capture is a convenience, and a browser that refuses it
    // must not take the hold down with it.
    startHold();
    capturePointer(event.currentTarget, event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    releasePointer(event.currentTarget, event.pointerId);
    cancelHold();
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    // Only reached when the capture below was refused: a captured pointer gets
    // no boundary events at all. A finger does not get this reading either way
    // — WebKit fires leave repeatedly for a touch that never moved, which
    // would cancel every hold on the frame it started.
    if (event.pointerType !== "touch") cancelHold();
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    // Leaving the button abandons the hold, and while the pointer is captured
    // nothing announces that: no boundary events, and `touch-none` means a
    // finger sliding off cannot scroll and so cannot cancel either. Measure it
    // instead — off the button ends the hold, wherever the pointer then goes.
    if (!holding) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) cancelHold();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      cancelHold();
    }
  };

  const handleFillComplete = () => {
    if (!holding || completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    onHoldComplete?.();
  };

  const active = holding || completed;
  const activeTransform =
    type === "horizontal" ? "translateX(0%)" : "translateY(0%)";
  const idleTransform =
    type === "horizontal" ? "translateX(-100%)" : "translateY(115%)";

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={typeof children === "string" ? children : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelHold}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(event) => event.preventDefault()}
      whileTap={reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={cn(
        "relative inline-grid h-16 min-w-72 touch-none place-items-center overflow-hidden rounded-[var(--hold-radius)] bg-primary px-8 text-primary-foreground",
        "[--hold-radius:22px]",
        TOUCH_GESTURE_CLASS,
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {/* Safari hands the fill its own compositing layer and then stops
          applying the button's rounded overflow clip to it, so the liquid
          bleeds past the corners. clip-path survives compositing. It lives on
          this static layer rather than the button so it never cuts the focus
          ring, and reads the same radius so the two cannot drift apart. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [clip-path:inset(0_round_var(--hold-radius))]"
      >
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={
            reduce
              ? { opacity: active ? 1 : 0, transform: "none" }
              : {
                  opacity: 1,
                  transform: active ? activeTransform : idleTransform,
                }
          }
          transition={
            active
              ? { duration: holdDuration / 1000, ease: "linear" }
              : { duration: reduce ? 0.15 : 0.24, ease: EASE_OUT }
          }
          onAnimationComplete={handleFillComplete}
          className={cn(
            "absolute inset-0 bg-sky-400 will-change-[opacity,transform]",
            fillClassName,
          )}
        >
          {!reduce ? (
            type === "horizontal" ? (
              <motion.svg
                viewBox="0 0 24 240"
                preserveAspectRatio="none"
                aria-hidden="true"
                animate={{
                  transform: active ? "translateY(-50%)" : "translateY(0%)",
                }}
                transition={{
                  duration: 1.1,
                  ease: "linear",
                  repeat: active ? Number.POSITIVE_INFINITY : 0,
                }}
                className="absolute -right-5 top-0 h-[200%] w-6 text-sky-400"
              >
                <path
                  d="M0 0h12C2 20 2 40 12 60s10 40 0 60-10 40 0 60 10 40 0 60H0Z"
                  fill="currentColor"
                />
              </motion.svg>
            ) : (
              <motion.svg
                viewBox="0 0 240 24"
                preserveAspectRatio="none"
                aria-hidden="true"
                animate={{
                  transform: active ? "translateX(-50%)" : "translateX(0%)",
                }}
                transition={{
                  duration: 1.1,
                  ease: "linear",
                  repeat: active ? Number.POSITIVE_INFINITY : 0,
                }}
                className="absolute -top-5 left-0 h-6 w-[200%] text-sky-400"
              >
                <path
                  d="M0 12C20 2 40 2 60 12s40 10 60 0 40-10 60 0 40 10 60 0v12H0Z"
                  fill="currentColor"
                />
              </motion.svg>
            )
          ) : null}
        </motion.span>
      </span>

      <span
        className={cn(
          "relative z-10 grid place-items-center text-base font-medium tracking-[-0.01em]",
          labelClassName,
        )}
      >
        <motion.span
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden={!holding || completed}
          animate={{ opacity: holding && !completed ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {holdingLabel}
        </motion.span>
        <motion.span
          aria-hidden={!completed}
          animate={{ opacity: completed ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {completeLabel}
        </motion.span>
      </span>
    </motion.button>
  );
});
