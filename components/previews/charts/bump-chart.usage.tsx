"use client";

import {
  BumpChart,
  BumpChartLegend,
  BumpChartPlot,
  type BumpChartSeries,
} from "@/components/charts/bump-chart";

/** Supply new rank arrays to animate between snapshots; keep series IDs stable. */
export function BumpChartExample({
  series,
  periods,
}: {
  series: readonly BumpChartSeries[];
  periods: readonly string[];
}) {
  return (
    <BumpChart series={series} periods={periods} label="Product rankings">
      <BumpChartPlot />
      <BumpChartLegend />
    </BumpChart>
  );
}
