"use client";

import { cn } from "@/lib/utils";
import { StatusBarContext, useStatusBarModel, type StatusBarProps } from "./status-bar/context";
import { StatusBarLegend } from "./status-bar/legend";
import { StatusBarPlot } from "./status-bar/plot";
import { StatusBarTooltip } from "./status-bar/tooltip";

/** Compose Plot, Tooltip, and Legend, or omit children for the complete chart. */
export function StatusBar({
  data,
  statuses,
  label,
  activeId,
  defaultActiveId,
  onActiveChange,
  children,
  className,
  ...props
}: StatusBarProps) {
  const model = useStatusBarModel({
    data,
    statuses,
    label,
    activeId,
    defaultActiveId,
    onActiveChange,
  });
  return (
    <StatusBarContext.Provider value={model}>
      <section
        aria-label={model.label}
        {...props}
        data-slot="status-bar"
        className={cn("min-w-0 w-full space-y-3", className)}
      >
        {children === undefined ? (
          <>
            <StatusBarPlot />
            <StatusBarTooltip />
            <StatusBarLegend />
          </>
        ) : (
          children
        )}
        {/* Color is never the only way to read the history. The complete data
            stays available to screen readers without dozens of tab stops. */}
        <div className="sr-only">
          <table>
            <caption>{model.label} data</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Status</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map(({ datum, status }) => (
                <tr key={datum.id}>
                  <th scope="row">{datum.label}</th>
                  <td>{status.label}</td>
                  <td>{datum.description ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </StatusBarContext.Provider>
  );
}

export { useStatusBar, STATUS_BAR_STATUSES } from "./status-bar/context";
export type { StatusBarProps, StatusBarDatum, StatusBarStatus } from "./status-bar/context";
export { StatusBarLegend } from "./status-bar/legend";
export type { StatusBarLegendProps } from "./status-bar/legend";
export { StatusBarPlot } from "./status-bar/plot";
export type { StatusBarPlotProps } from "./status-bar/plot";
export { StatusBarTooltip } from "./status-bar/tooltip";
export type { StatusBarTooltipProps, StatusBarTooltipData } from "./status-bar/tooltip";
