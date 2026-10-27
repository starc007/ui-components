"use client";

import {
  LineChart,
  LineChartLegend,
  LineChartPlot,
  type LineChartSeries,
  LineChartTooltip,
} from "@/components/charts/line-chart";

/** Pass one value per category for each series; null leaves a gap. Keep series
 * ids stable and new values morph the lines instead of redrawing them. */
export function LineChartExample({
  series,
  categories,
}: {
  series: readonly LineChartSeries[];
  categories: readonly string[];
}) {
  return (
    <LineChart
      series={series}
      categories={categories}
      variant="area"
      label="Monthly revenue"
      formatValue={(value) => `$${value.toLocaleString("en-US")}`}
    >
      <LineChartPlot height={280} />
      <LineChartTooltip />
      <LineChartLegend />
    </LineChart>
  );
}
