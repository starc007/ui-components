"use client";

import { MotionConfig } from "motion/react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { cn } from "@/lib/utils";

export interface XYTooltipRow {
  id: string;
  name: string;
  color: string;
  value: number | null;
}

function Value({ value, format }: { value: number; format: (value: number) => string }) {
  return (
    // Keep the short digit tween when composed inside spring-based Tabs.
    <MotionConfig transition={{ type: "tween" }}>
      <NumberTicker
        value={value}
        // Keep the consumer's exact formatting, including fractions and units.
        format={() => format(value)}
        startOnView={false}
        duration={0.2}
        stagger={0}
        className="whitespace-pre"
      />
    </MotionConfig>
  );
}

export function XYTooltipContent({
  title,
  rows,
  formatValue,
  total,
  compact = false,
  className,
}: {
  title: string;
  rows: readonly XYTooltipRow[];
  formatValue: (value: number) => string;
  total?: number | null;
  /** Size to the content instead of a fixed panel width, for pointer-following readouts. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("block max-w-full min-w-0", compact ? "min-w-36" : "w-56", className)}>
      <span className={cn("block text-xs font-medium", compact ? "mb-1.5" : "mb-2")}>{title}</span>
      <span className={cn("grid", compact ? "gap-1" : "gap-1.5")}>
        {rows.map((row) => (
          <span key={row.id} className="flex items-center gap-2 text-[11px]">
            <span
              aria-hidden="true"
              className="h-2.5 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="min-w-0 flex-1 truncate pr-3 text-muted-foreground">{row.name}</span>
            <span className="shrink-0 font-mono tabular-nums">
              {row.value === null ? "No data" : <Value value={row.value} format={formatValue} />}
            </span>
          </span>
        ))}
        {total !== undefined && total !== null ? (
          <span className="mt-0.5 flex items-center gap-2 border-t border-border pt-1.5 text-[11px]">
            <span className="flex-1 text-muted-foreground">Total</span>
            <span className="font-mono font-medium tabular-nums">
              <Value value={total} format={formatValue} />
            </span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
