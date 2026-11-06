"use client";

import { cn } from "@/lib/utils";
import { BumpChartContext, type BumpChartProps, useBumpChartModel } from "./bump-chart/context";
import { BumpChartLegend } from "./bump-chart/legend";
import { BumpChartPlot } from "./bump-chart/plot";

/** Compose the plot and legend, or supply children for your own arrangement. */
export function BumpChart({ children, className, ...props }: BumpChartProps) {
  const model = useBumpChartModel(props);
  return (
    <BumpChartContext.Provider value={model}>
      <section aria-label={model.label} className={cn("w-full space-y-5", className)}>
        {children === undefined ? (
          <>
            <BumpChartPlot />
            <BumpChartLegend />
          </>
        ) : (
          children
        )}
      </section>
    </BumpChartContext.Provider>
  );
}

export type { BumpChartProps } from "./bump-chart/context";
export { useBumpChart } from "./bump-chart/context";
export { BumpChartLegend } from "./bump-chart/legend";
export { type BumpChartMessages, bumpChartMessages } from "./bump-chart/messages";
export { BumpChartPlot } from "./bump-chart/plot";
export type BumpChartSeries = import("./bump-chart/model").BumpSeries;
