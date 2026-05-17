"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface NumberTickerProps {
  value: number;
  /** Digits to pad to (left). */
  pad?: number;
  /** Per-digit roll duration in seconds. */
  duration?: number;
  /** Stagger between digits. */
  stagger?: number;
  /** Render only after the element enters the viewport. */
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  digitClassName?: string;
  /** Format the integer value (e.g. group separators). Returns string of digits + separators; non-digits passed through. */
  format?: (value: number) => string;
}

const DIGIT_HEIGHT_EM = 1.1;

export function NumberTicker({
  value,
  pad,
  duration = 0.9,
  stagger = 0.04,
  startOnView = true,
  prefix,
  suffix,
  className,
  digitClassName,
  format,
}: NumberTickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.6 });
  const [armed, setArmed] = useState(!startOnView);

  useEffect(() => {
    if (startOnView && inView) setArmed(true);
  }, [startOnView, inView]);

  const text = useMemo(() => {
    const formatted = format ? format(Math.round(value)) : Math.round(value).toString();
    return pad ? formatted.padStart(pad, "0") : formatted;
  }, [value, pad, format]);

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex items-center tabular-nums", className)}
      aria-label={`${prefix ?? ""}${text}${suffix ?? ""}`}
    >
      {prefix ? <span>{prefix}</span> : null}
      {text.split("").map((char, i) => {
        const isDigit = /\d/.test(char);
        if (!isDigit) {
          return (
            <span key={`s-${i}`} className="inline-block">
              {char}
            </span>
          );
        }
        const digit = Number(char);
        return (
          <Digit
            key={`d-${i}`}
            digit={armed ? digit : 0}
            delay={i * stagger}
            duration={duration}
            className={digitClassName}
          />
        );
      })}
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}

function Digit({
  digit,
  delay,
  duration,
  className,
}: {
  digit: number;
  delay: number;
  duration: number;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: "1ch" }}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: `-${digit * DIGIT_HEIGHT_EM}em` }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 top-0 flex flex-col items-center"
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1.1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
