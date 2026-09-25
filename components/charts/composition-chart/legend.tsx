"use client";

import { cn } from "@/lib/utils";
import { useCompositionChart } from "./context";

export function CompositionChartLegend({ className }: { className?: string }) {
  const { column, highlight, pinned, setPinned, setHovered, setFocused, canHover, formatValue } =
    useCompositionChart();
  if (!column) return null;
  const ranked = [...column.segments].sort((a, b) => b.share - a.share);
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1 flex min-h-6 items-center gap-3 px-2 text-xs">
        <span className="font-medium text-foreground">{column.id}</span>
        <span className="text-muted-foreground">{column.valid ? "Share" : "No data"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {ranked.map((row, rank) => (
          <button
            key={row.id}
            type="button"
            aria-label={`Highlight ${row.name}`}
            aria-pressed={pinned === row.id}
            onClick={() => setPinned(pinned === row.id ? null : row.id)}
            onPointerEnter={() => {
              if (canHover) setHovered(row.id);
            }}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setFocused(row.id)}
            onBlur={() => setFocused(null)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setPinned(null);
                setHovered(null);
                setFocused(null);
              }
            }}
            className={cn(
              "flex min-h-11 max-w-full items-center gap-2.5 rounded-md px-2 text-left text-xs transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              pinned === row.id && "bg-muted/60",
              highlight && highlight !== row.id && "opacity-40",
            )}
          >
            <span className="w-3 shrink-0 font-mono text-[10px] text-muted-foreground">
              {column.valid ? rank + 1 : "—"}
            </span>
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="min-w-0 truncate">{row.name}</span>
            <span
              title={row.value === null ? "Missing value" : formatValue(row.value)}
              className="shrink-0 font-mono tabular-nums"
            >
              {column.valid ? `${row.share.toFixed(1)}%` : "—"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
