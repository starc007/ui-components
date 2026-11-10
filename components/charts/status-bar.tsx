"use client";

import { cn } from "@/lib/utils";
import { StatusBarContext, type StatusBarProps, useStatusBarModel } from "./status-bar/context";
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
  labels,
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
    labels,
  });
  const { t } = model;
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
            <caption>{t("tableCaption", { label: model.label })}</caption>
            <thead>
              <tr>
                <th scope="col">{t("period")}</th>
                <th scope="col">{t("status")}</th>
                <th scope="col">{t("details")}</th>
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

export type { StatusBarDatum, StatusBarProps, StatusBarStatus } from "./status-bar/context";
export { STATUS_BAR_STATUSES, useStatusBar } from "./status-bar/context";
export type { StatusBarLegendProps } from "./status-bar/legend";
export { StatusBarLegend } from "./status-bar/legend";
export { type StatusBarMessages, statusBarMessages } from "./status-bar/messages";
export type { StatusBarPlotProps } from "./status-bar/plot";
export { StatusBarPlot } from "./status-bar/plot";
export type { StatusBarTooltipData, StatusBarTooltipProps } from "./status-bar/tooltip";
export { StatusBarTooltip } from "./status-bar/tooltip";
