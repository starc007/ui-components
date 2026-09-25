"use client";

import { cn } from "@/lib/utils";
import { useCompositionChart } from "./context";

export function CompositionTooltipContent({ className }: { className?: string }) {
  const { column, formatValue } = useCompositionChart();
  if (!column) return null;
  return (
    <span className={cn("block w-72 max-w-full min-w-0", className)}>
      <span className="mb-2 block text-xs font-medium">{column.id}</span>
      {column.valid ? (
        <span className="grid gap-2">
          {column.segments.map((row) => (
            <span key={row.id} className="flex items-center gap-2 text-[11px]">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              <span className="max-w-28 shrink-0 truncate text-muted-foreground tabular-nums"
                title={formatValue(row.value ?? 0)}>
                {formatValue(row.value ?? 0)}
              </span>
              <span className="w-12 shrink-0 text-right font-mono tabular-nums">
                {row.share.toFixed(1)}%
              </span>
            </span>
          ))}
        </span>
      ) : (
        <span className="block text-xs text-muted-foreground">
          No complete data for this period.
        </span>
      )}
    </span>
  );
}
