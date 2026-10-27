"use client";

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
    <NumberTicker
      value={value}
      // Keep the consumer's exact formatting, including fractions and units.
      format={() => format(value)}
      startOnView={false}
      duration={0.2}
      stagger={0}
      className="whitespace-pre"
    />
  );
}

export function XYTooltipContent({
  title,
  rows,
  formatValue,
  total,
  className,
}: {
  title: string;
  rows: readonly XYTooltipRow[];
  formatValue: (value: number) => string;
  total?: number | null;
  className?: string;
}) {
  return (
    <span className={cn("block w-56 max-w-full min-w-0", className)}>
      <span className="mb-2 block text-xs font-medium">{title}</span>
      <span className="grid gap-1.5">
        {rows.map((row) => (
          <span key={row.id} className="flex items-center gap-2 text-[11px]">
            <span
              aria-hidden="true"
              className="h-2.5 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.name}</span>
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
