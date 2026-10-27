"use client";

import { XYLegend } from "../xy/legend";
import { useLineChart } from "./context";

export interface LineChartLegendProps {
  className?: string;
}

/** Toggle a series to hide it; the axis rescales to what is left. */
export function LineChartLegend({ className }: LineChartLegendProps) {
  const { rows, hidden, toggle, setHovered, canHover } = useLineChart();
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
