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
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Follows the pointer like the other beUI charts' readouts. Keyboard
 * inspection, which has no pointer, anchors at the end of the category's
 * longest bar instead.
 */
export function BarChartTooltip({ children, className, side = "top" }: BarChartTooltipProps) {
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
  const reach = layout === "stacked" ? total : Math.max(0, ...rows.map((row) => row.value ?? 0));
  const along = Math.min(1, reach / (domain.max || 1));
  const across = (Math.max(order.indexOf(activeIndex), 0) + 0.5) / Math.max(categories.length, 1);
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      followCursor
      anchorPoint={
        orientation === "vertical" ? { x: across, y: 1 - along } : { x: along, y: across }
      }
      open={open && category !== undefined}
      onOpenChange={setOpen}
      side={side}
      className={cn("max-w-64", className)}
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
              compact
            />
          ))
        )
      }
    />
  );
}
