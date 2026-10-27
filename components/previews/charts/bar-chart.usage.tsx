"use client";

import {
  BarChart,
  BarChartLegend,
  BarChartPlot,
  type BarChartSeries,
  BarChartTooltip,
} from "@/components/charts/bar-chart";

/** Pass one nonnegative value per category for each series. Keep category
 * labels and series ids stable so bars grow, shrink and reorder in place. */
export function BarChartExample({
  series,
  categories,
}: {
  series: readonly BarChartSeries[];
  categories: readonly string[];
}) {
  return (
    <BarChart
      series={series}
      categories={categories}
      layout="stacked"
      sort="descending"
      label="Revenue by region"
      formatValue={(value) => `$${value.toLocaleString("en-US")}`}
    >
      <BarChartPlot />
      <BarChartTooltip />
      <BarChartLegend />
    </BarChart>
  );
}
