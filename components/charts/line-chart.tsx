"use client";

import { cn } from "@/lib/utils";
import { LineChartContext, type LineChartProps, useLineChartModel } from "./line-chart/context";
import { LineChartLegend } from "./line-chart/legend";
import { LineChartPlot } from "./line-chart/plot";
import { LineChartTooltip } from "./line-chart/tooltip";
import { XYDataTable } from "./xy/data-table";

/** Compose Plot, Tooltip and Legend, or omit children for the complete chart. */
export function LineChart({
  series,
  categories,
  variant,
  curve,
  domain,
  activeId,
  defaultActiveId,
  onActiveChange,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  formatValue,
  formatTick,
  label,
  status,
  loadingLabel,
  children,
  className,
  ...props
}: LineChartProps) {
  const model = useLineChartModel({
    series,
    categories,
    variant,
    curve,
    domain,
    activeId,
    defaultActiveId,
    onActiveChange,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
    formatValue,
    formatTick,
    label,
    status,
    loadingLabel,
  });
  return (
    <LineChartContext.Provider value={model}>
      <section
        aria-label={model.label}
        aria-busy={model.loading || undefined}
        {...props}
        data-slot="line-chart"
        className={cn("w-full min-w-0 space-y-3", className)}
      >
        {children === undefined ? (
          <>
            <LineChartPlot />
            <LineChartTooltip />
            {model.rows.length > 1 ? <LineChartLegend /> : null}
          </>
        ) : (
          children
        )}
        {/* Placeholder or stale values are not data yet. */}
        {model.loading ? null : (
          <XYDataTable
            label={model.label}
            rows={model.rows}
            categories={model.categories}
            formatValue={model.formatValue}
          />
        )}
      </section>
    </LineChartContext.Provider>
  );
}

export type { LineChartProps } from "./line-chart/context";
export { useLineChart } from "./line-chart/context";
export type { LineChartLegendProps } from "./line-chart/legend";
export { LineChartLegend } from "./line-chart/legend";
export type { LineChartPlotProps } from "./line-chart/plot";
export { LineChartPlot } from "./line-chart/plot";
export type { LineChartTooltipData, LineChartTooltipProps } from "./line-chart/tooltip";
export { LineChartTooltip } from "./line-chart/tooltip";
export type { XYSeries as LineChartSeries } from "./xy/model";
export type { XYCurve as LineChartCurve } from "./xy/path";
