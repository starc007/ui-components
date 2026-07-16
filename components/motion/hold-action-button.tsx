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
import { cn } from "@/lib/utils";

export interface HoldActionButtonProps extends Omit<
  HTMLMotionProps<"button">,
  | "children"
  | "onClick"
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerLeave"
  | "onKeyDown"
  | "onKeyUp"
> {
  children: ReactNode;
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
    event.currentTarget.setPointerCapture(event.pointerId);
    startHold();
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelHold();
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

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={typeof children === "string" ? children : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(event) => event.preventDefault()}
      whileTap={reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={cn(
        "relative inline-grid h-16 min-w-72 touch-none select-none place-items-center overflow-hidden rounded-[22px] bg-slate-950 px-8 text-white",
        "outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          reduce
            ? { opacity: active ? 1 : 0, transform: "none" }
            : {
                opacity: 1,
                transform: active ? "translateY(0%)" : "translateY(115%)",
              }
        }
        transition={
          active
            ? { duration: holdDuration / 1000, ease: "linear" }
            : { duration: reduce ? 0.15 : 0.24, ease: EASE_OUT }
        }
        onAnimationComplete={handleFillComplete}
        className={cn(
          "absolute inset-0 bg-sky-500 will-change-[opacity,transform]",
          fillClassName,
        )}
      >
        {!reduce ? (
          <motion.svg
            viewBox="0 0 240 24"
            preserveAspectRatio="none"
            aria-hidden="true"
            animate={{ transform: active ? "translateX(-50%)" : "translateX(0%)" }}
            transition={{
              duration: 1.1,
              ease: "linear",
              repeat: active ? Number.POSITIVE_INFINITY : 0,
            }}
            className="absolute -top-5 left-0 h-6 w-[200%] text-sky-500"
          >
            <path
              d="M0 12C20 2 40 2 60 12s40 10 60 0 40-10 60 0 40 10 60 0v12H0Z"
              fill="currentColor"
            />
          </motion.svg>
        ) : null}
      </motion.span>

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
