"use client";

/* The value rolls digit by digit (up when it grows, down when it shrinks) in
 * a stable container, and the caption slides through a clipped line, so
 * moving between segments reads as one readout updating rather than a
 * replaced block. Reduced motion: both swap with a short fade. */

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useDonutChart } from "./context";
import type { PlacedSegment } from "./model";

export type DonutChartCenterProps = {
  /**
   * Custom content for the hole. Receives the focused segment, or null when
   * nothing is focused, and the total. Defaults to a rolling value and caption.
   */
  children?: (segment: PlacedSegment | null, total: number) => ReactNode;
  /** Caption under the total when nothing is focused. */
  totalLabel?: ReactNode;
  className?: string;
};

export function DonutChartCenter({ children, totalLabel = "Total", className }: DonutChartCenterProps) {
  const { placed, active, total, formatValue, reduce } = useDonutChart();
  const segment = placed.find((item) => item.id === active) ?? null;
  const value = segment?.value ?? total;
  // Roll digits in the direction the value moved, adjusted during render so
  // the first frame of a change already rolls the right way.
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState<"up" | "down">("up");
  if (value !== previous) {
    setPrevious(value);
    setDirection(value > previous ? "up" : "down");
  }

  if (children) {
    return (
      <div aria-live="polite" className={cn("relative max-w-[56%]", className)}>
        {children(segment, total)}
      </div>
    );
  }

  return (
    <div aria-live="polite" className={cn("relative max-w-[56%]", className)}>
      <p className="text-2xl font-medium tracking-tight tabular-nums">
        <DigitSwap value={formatValue(value)} direction={direction} />
      </p>
      <div className="relative mt-1 h-4 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={segment?.id ?? "total"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%" }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap text-xs leading-4 text-muted-foreground"
          >
            {segment ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="truncate">
                  {segment.name} · {(segment.share * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              totalLabel
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
