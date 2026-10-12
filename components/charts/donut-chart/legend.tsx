"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useDonutChart } from "./context";
import type { PlacedSegment } from "./model";

export type DonutChartLegendProps = {
  /** Extra line under each name, such as terms or a note. */
  renderDetail?: (segment: PlacedSegment) => ReactNode;
  /** Trailing value. Defaults to the share and formatted value. */
  renderValue?: (segment: PlacedSegment) => ReactNode;
  className?: string;
};

/**
 * Legend rows share focus with the ring: hovering or focusing a row pops its
 * segment, and arrow keys move between rows. Each row carries a share bar.
 */
export function DonutChartLegend({ renderDetail, renderValue, className }: DonutChartLegendProps) {
  const { placed, active, setActive, onSelect, selectedId, formatValue, reduce, canHover } =
    useDonutChart();
  return (
    <ul className={cn("space-y-1", className)}>
      {placed.map((segment, index) => {
        const focused = active === segment.id;
        return (
          <li key={segment.id}>
            <button
              type="button"
              data-donut-legend
              aria-pressed={onSelect ? selectedId === segment.id : undefined}
              onClick={() => onSelect?.(segment.id)}
              onPointerEnter={canHover ? () => setActive(segment.id) : undefined}
              onPointerLeave={canHover ? () => setActive(null) : undefined}
              onFocus={() => setActive(segment.id)}
              onBlur={() => setActive(null)}
              onKeyDown={(event) => {
                const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
                if (!step) return;
                event.preventDefault();
                const rows = event.currentTarget
                  .closest("ul")
                  ?.querySelectorAll<HTMLButtonElement>("[data-donut-legend]");
                rows?.[(index + step + placed.length) % placed.length]?.focus();
              }}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left outline-none transition-colors duration-150",
                "focus-visible:ring-2 focus-visible:ring-ring",
                focused ? "bg-muted" : "hover:bg-muted/60",
                selectedId === segment.id && "ring-1 ring-border",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{segment.name}</span>
                <span className="shrink-0 text-right text-sm tabular-nums">
                  {renderValue ? (
                    renderValue(segment)
                  ) : (
                    <>
                      <span className="font-medium">{(segment.share * 100).toFixed(1)}%</span>
                      <span className="ml-2 text-muted-foreground">{formatValue(segment.value)}</span>
                    </>
                  )}
                </span>
              </span>
              {renderDetail ? (
                <span className="mt-0.5 block pl-5.5 text-xs text-muted-foreground">
                  {renderDetail(segment)}
                </span>
              ) : null}
              <span aria-hidden="true" className="mt-2 ml-5.5 block h-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className="block h-full origin-left rounded-full"
                  style={{ backgroundColor: segment.color }}
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: segment.share }}
                  transition={reduce ? { duration: 0 } : { ...SPRING_LAYOUT, delay: 0.2 + index * 0.06 }}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
