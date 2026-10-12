"use client";

import {
  DonutChart,
  DonutChartCenter,
  DonutChartLegend,
  DonutChartPlot,
  type DonutSegment,
} from "@/components/charts/donut-chart";

/** Pass a handful of nonnegative parts; shares are computed from the total. */
export function DonutChartExample({ segments }: { segments: readonly DonutSegment[] }) {
  return (
    <DonutChart
      segments={segments}
      label="Monthly revenue by plan"
      formatValue={(value) =>
        value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      }
    >
      <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,16rem)_1fr]">
        <DonutChartPlot>
          <DonutChartCenter totalLabel="Monthly revenue" />
        </DonutChartPlot>
        <DonutChartLegend />
      </div>
    </DonutChart>
  );
}
