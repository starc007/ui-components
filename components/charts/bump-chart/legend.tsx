"use client";

import { cn } from "@/lib/utils";
import { useBumpChart } from "./context";

export function BumpChartLegend({ className }: { className?: string }) {
  const { rows, pinned, highlighted, select, setHovered, setFocused, canHover } = useBumpChart();
  return (
    <div className={cn("grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3", className)}>
      {rows.map((row) => {
        const first = row.ranks[0];
        const last = row.ranks.at(-1);
        const gain = first != null && last != null ? first - last : null;
        return (
          <button
            key={row.id}
            type="button"
            aria-label={`Highlight ${row.name}`}
            aria-pressed={pinned === row.id}
            onClick={() => select(pinned === row.id ? null : row.id)}
            onPointerEnter={() => {
              if (canHover) setHovered(row.id);
            }}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setFocused(row.id)}
            onBlur={() => setFocused(null)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                select(null);
                setFocused(null);
                setHovered(null);
              }
            }}
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-md px-2 py-2.5 text-xs text-foreground transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              highlighted && highlighted !== row.id && "opacity-35",
              pinned === row.id && "bg-muted/60",
            )}
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="truncate">{row.name}</span>
            <span className="ml-auto font-mono tabular-nums">
              {last == null ? "—" : `#${last}`}
            </span>
            <span
              className="min-w-5 text-right font-mono text-[10px] tabular-nums text-muted-foreground"
              title={
                gain == null
                  ? "Change unavailable"
                  : gain === 0
                    ? "Unchanged"
                    : `${gain > 0 ? "Up" : "Down"} ${Math.abs(gain)} places`
              }
            >
              {gain == null || gain === 0 ? "—" : `${gain > 0 ? "↑" : "↓"}${Math.abs(gain)}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
