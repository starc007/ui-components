"use client";

import { cn } from "@/lib/utils";
import { DonutChartCenter } from "./donut-chart/center";
import { type DonutChartProps, DonutContext, useDonutModel } from "./donut-chart/context";
import { DonutChartLegend } from "./donut-chart/legend";
import { DonutChartPlot } from "./donut-chart/plot";

/**
 * A ring of rounded segments with a linked center readout and legend.
 *
 * ```tsx
 * <DonutChart segments={segments} formatValue={usd}>
 *   <DonutChartPlot>
 *     <DonutChartCenter totalLabel="Monthly revenue" />
 *   </DonutChartPlot>
 *   <DonutChartLegend />
 * </DonutChart>
 * ```
 */
export function DonutChart({ className, children, ...props }: DonutChartProps) {
  const model = useDonutModel(props);
  return (
    <DonutContext.Provider value={model}>
      <div className={cn("w-full", className)}>
        {children ?? (
          <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,16rem)_1fr]">
            <DonutChartPlot>
              <DonutChartCenter />
            </DonutChartPlot>
            <DonutChartLegend />
          </div>
        )}
      </div>
    </DonutContext.Provider>
  );
}

export { DonutChartCenter, type DonutChartCenterProps } from "./donut-chart/center";
export { type DonutChartProps, useDonutChart } from "./donut-chart/context";
export { DonutChartLegend, type DonutChartLegendProps } from "./donut-chart/legend";
export type { DonutSegment, PlacedSegment as DonutPlacedSegment } from "./donut-chart/model";
export { DonutChartPlot, type DonutChartPlotProps } from "./donut-chart/plot";
