"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type SpinnerVariant = "ring" | "dots";

export interface SpinnerProps {
  className?: string;
  size?: number;
  variant?: SpinnerVariant;
  label?: string;
}

export function Spinner({
  className,
  size = 28,
  variant = "ring",
  label = "Loading",
}: SpinnerProps) {
  const reduce = useReducedMotion();

  if (variant === "dots") {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <span className="inline-flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              aria-hidden
              animate={
                reduce
                  ? { opacity: [0.5, 1, 0.5] }
                  : { y: [0, -3, 0], opacity: [0.45, 1, 0.45], scale: [0.92, 1, 0.92] }
              }
              transition={{
                duration: 0.9,
                delay: dot * 0.12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="block rounded-full bg-current"
              style={{ width: Math.max(size / 5.5, 4), height: Math.max(size / 5.5, 4) }}
            />
          ))}
        </span>
      </span>
    );
  }

  return (
    <motion.span
      role="status"
      aria-label={label}
      animate={reduce ? undefined : { rotate: 360 }}
      transition={reduce ? undefined : { duration: 0.9, ease: "linear", repeat: Infinity }}
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="text-current"
        aria-hidden
      >
        <title>{label}</title>
        <circle
          cx="12"
          cy="12"
          r="9"
          className="stroke-current/20"
          strokeWidth="3"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={false}
          animate={
            reduce
              ? { pathLength: 0.35, opacity: 1 }
              : { pathLength: [0.2, 0.46, 0.2], opacity: [0.75, 1, 0.75] }
          }
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ pathLength: 0.28, pathOffset: 0.1 }}
        />
      </svg>
    </motion.span>
  );
}
