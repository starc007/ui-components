"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { XYTooltipContent, type XYTooltipRow } from "../xy/tooltip-content";
import { useBarChart } from "./context";

export interface BarChartTooltipData {
  category: string;
  index: number;
  rows: XYTooltipRow[];
  total: number;
}

export interface BarChartTooltipProps {
  children?: ReactNode | ((data: BarChartTooltipData) => ReactNode);
  className?: string;
  /** Defaults to `top` for vertical bars and `right` for horizontal bars. */
  side?: "top" | "right" | "bottom" | "left";
}

/** Snaps to the inspected category, at the end of its longest bar. */
export function BarChartTooltip({ children, className, side }: BarChartTooltipProps) {
  const {
    categories,
    visibleRows,
    order,
    totals,
    domain,
    layout,
    orientation,
    activeIndex,
    open,
    setOpen,
    plotRef,
    tooltipId,
    formatValue,
  } = useBarChart();
  const category = categories[activeIndex];
  const rows: XYTooltipRow[] = visibleRows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    value: row.values[activeIndex] ?? null,
  }));
  const total = totals[activeIndex] ?? 0;
  const reach =
    layout === "stacked"
      ? total
      : Math.max(0, ...rows.map((row) => row.value ?? 0));
  const vertical = orientation === "vertical";
  // Horizontal tooltips start past the longest bar of any row, so a longer
  // neighbour never sits under the tooltip.
  const longest = vertical
    ? reach
    : layout === "stacked"
      ? Math.max(0, ...totals)
      : Math.max(0, ...visibleRows.flatMap((row) => row.values.map((value) => value ?? 0)));
  const along = Math.min(1, longest / (domain.max || 1));
  const across = (Math.max(order.indexOf(activeIndex), 0) + 0.5) / Math.max(categories.length, 1);
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      anchorPoint={vertical ? { x: across, y: 1 - along } : { x: along, y: across }}
      sideOffset={10}
      open={open && category !== undefined}
      onOpenChange={setOpen}
      side={side ?? (vertical ? "top" : "right")}
      className={cn("max-w-[calc(100vw-1rem)]", className)}
      content={
        category === undefined ? null : typeof children === "function" ? (
          children({ category, index: activeIndex, rows, total })
        ) : (
          (children ?? (
            <XYTooltipContent
              title={category}
              rows={rows}
              formatValue={formatValue}
              total={layout === "stacked" && rows.length > 1 ? total : undefined}
            />
          ))
        )
      }
    />
  );
}
