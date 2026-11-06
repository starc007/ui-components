"use client";

import { cn } from "@/lib/utils";
import {
  type CompositionChartProps,
  CompositionContext,
  useCompositionModel,
} from "./composition-chart/context";
import { CompositionChartLegend } from "./composition-chart/legend";
import { CompositionChartPlot } from "./composition-chart/plot";

/** Normalized stacked shares. Zero-total or incomplete periods are shown as gaps. */
export function CompositionChart({ className, children, ...props }: CompositionChartProps) {
  const model = useCompositionModel(props);
  return (
    <CompositionContext.Provider value={model}>
      <section aria-label={model.label} className={cn("@container w-full space-y-4", className)}>
        {children === undefined ? (
          <div className="grid gap-4">
            <CompositionChartPlot />
            <CompositionChartLegend />
          </div>
        ) : (
          children
        )}
      </section>
    </CompositionContext.Provider>
  );
}

export type { CompositionChartProps } from "./composition-chart/context";
export { useCompositionChart } from "./composition-chart/context";
export { CompositionChartLegend } from "./composition-chart/legend";
export {
  type CompositionChartMessages,
  compositionChartMessages,
} from "./composition-chart/messages";
export type { CompositionSeries as CompositionChartSeries } from "./composition-chart/model";
export { CompositionChartPlot } from "./composition-chart/plot";
