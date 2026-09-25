"use client";

import {
  CompositionChart,
  CompositionChartLegend,
  CompositionChartPlot,
  type CompositionChartSeries,
} from "@/components/charts/composition-chart";

/** Pass raw nonnegative values; each complete period is normalized to 100%. */
export function CompositionChartExample({
  series,
  periods,
  view = "bar",
}: {
  series: readonly CompositionChartSeries[];
  periods: readonly string[];
  /** The same component supports both views. */
  view?: "bar" | "area";
}) {
  return (
    <CompositionChart series={series} periods={periods} view={view} label="Channel share over time">
      <div className="grid gap-4">
        <CompositionChartPlot />
        <CompositionChartLegend />
      </div>
    </CompositionChart>
  );
}
