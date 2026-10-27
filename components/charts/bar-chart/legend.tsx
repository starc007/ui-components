"use client";

import { XYLegend } from "../xy/legend";
import { useBarChart } from "./context";

export interface BarChartLegendProps {
  className?: string;
}

/** Toggle a series to hide it; its bars collapse and the axis rescales. */
export function BarChartLegend({ className }: BarChartLegendProps) {
  const { rows, hidden, toggle, setHovered, canHover } = useBarChart();
  return (
    <XYLegend
      rows={rows}
      hidden={hidden}
      onToggle={toggle}
      onHover={setHovered}
      canHover={canHover}
      label="Series"
      className={className}
    />
  );
}
