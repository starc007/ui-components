"use client";

import { cn } from "@/lib/utils";
import { BarChartContext, type BarChartProps, useBarChartModel } from "./bar-chart/context";
import { BarChartLegend } from "./bar-chart/legend";
import { BarChartPlot } from "./bar-chart/plot";
import { BarChartTooltip } from "./bar-chart/tooltip";
import { XYDataTable } from "./xy/data-table";

/** Compose Plot, Tooltip and Legend, or omit children for the complete chart. */
export function BarChart({
  series,
  categories,
  layout,
  orientation,
  sort,
  max,
  activeId,
  defaultActiveId,
  onActiveChange,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  formatValue,
  formatTick,
  label,
  labels,
  children,
  className,
  ...props
}: BarChartProps) {
  const model = useBarChartModel({
    series,
    categories,
    layout,
    orientation,
    sort,
    max,
    activeId,
    defaultActiveId,
    onActiveChange,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
    formatValue,
    formatTick,
    label,
    labels,
  });
  return (
    <BarChartContext.Provider value={model}>
      <section
        aria-label={model.label}
        {...props}
        data-slot="bar-chart"
        className={cn("w-full min-w-0 space-y-3", className)}
      >
        {children === undefined ? (
          <>
            <BarChartPlot />
            <BarChartTooltip />
            {model.rows.length > 1 ? <BarChartLegend /> : null}
          </>
        ) : (
          children
        )}
        <XYDataTable
          label={model.label}
          rows={model.rows}
          categories={model.categories}
          formatValue={model.formatValue}
          t={model.xy}
        />
      </section>
    </BarChartContext.Provider>
  );
}

export type { BarChartMessages, BarChartProps } from "./bar-chart/context";
export { barChartMessages, useBarChart } from "./bar-chart/context";
export type { BarChartLegendProps } from "./bar-chart/legend";
export { BarChartLegend } from "./bar-chart/legend";
export type { BarChartPlotProps } from "./bar-chart/plot";
export { BarChartPlot } from "./bar-chart/plot";
export type { BarChartTooltipData, BarChartTooltipProps } from "./bar-chart/tooltip";
export { BarChartTooltip } from "./bar-chart/tooltip";
export type { XYChartMessages } from "./xy/messages";
export { xyChartMessages } from "./xy/messages";
export type { XYSeries as BarChartSeries } from "./xy/model";
