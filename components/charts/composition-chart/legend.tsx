"use client";

import { cn } from "@/lib/utils";
import { useCompositionChart } from "./context";

export function CompositionChartLegend({ className }: { className?: string }) {
  const { column, highlight, pinned, setPinned, setHovered, setFocused, canHover, formatValue } =
    useCompositionChart();
  if (!column) return null;
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-2 gap-x-4 gap-y-1 @min-[480px]:grid-cols-3 @min-[900px]:grid-cols-6",
        className,
      )}
    >
      {column.segments.map((row) => (
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
            "flex min-h-12 min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            pinned === row.id && "bg-muted/60",
            highlight && highlight !== row.id && "opacity-40",
          )}
        >
          <span
            aria-hidden="true"
            className="h-6 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-muted-foreground">{row.name}</span>
            <span
              title={row.value === null ? "Missing value" : formatValue(row.value)}
              className="shrink-0 font-mono tabular-nums"
            >
              {column.valid ? `${row.share.toFixed(1)}%` : "—"}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
