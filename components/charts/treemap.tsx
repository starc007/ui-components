"use client";

import { cn } from "@/lib/utils";
import { TreemapContext, type TreemapProps, useTreemapModel } from "./treemap/context";
import { TreemapLegend } from "./treemap/legend";
import { TreemapPlot } from "./treemap/plot";
import { TreemapTooltip } from "./treemap/tooltip";

/** Compose Plot, Tooltip and Legend, or omit children for the complete chart. */
export function Treemap({
  data,
  label,
  formatValue,
  colors,
  textColor,
  activeId,
  defaultActiveId,
  onActiveChange,
  labels,
  className,
  children,
  ...props
}: TreemapProps) {
  const model = useTreemapModel({
    data,
    label,
    formatValue,
    colors,
    textColor,
    activeId,
    defaultActiveId,
    onActiveChange,
    labels,
  });
  const { t } = model;
  return (
    <TreemapContext.Provider value={model}>
      <section
        aria-label={model.label}
        {...props}
        data-slot="treemap"
        className={cn("min-w-0 w-full space-y-4", className)}
      >
        {children === undefined ? (
          <>
            <TreemapPlot />
            <TreemapTooltip />
            <TreemapLegend />
          </>
        ) : (
          children
        )}
        <div className="sr-only">
          <table>
            <caption>{t("tableCaption", { label: model.label })}</caption>
            <thead>
              <tr>
                <th scope="col">{t("item")}</th>
                <th scope="col">{t("value")}</th>
                <th scope="col">{t("share")}</th>
                <th scope="col">{t("details")}</th>
              </tr>
            </thead>
            <tbody>
              {model.items.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.path.join(" / ")}</th>
                  <td>{model.formatValue(item.value)}</td>
                  <td>{(item.share * 100).toFixed(1)}%</td>
                  <td>{item.description ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TreemapContext.Provider>
  );
}

export type { TreemapProps } from "./treemap/context";
export { useTreemap } from "./treemap/context";
export type { TreemapLegendProps } from "./treemap/legend";
export { TreemapLegend } from "./treemap/legend";
export { type TreemapMessages, treemapMessages } from "./treemap/messages";
export type {
  TreemapGroup,
  TreemapItem,
  TreemapLeaf,
  TreemapNode,
  TreemapTile,
} from "./treemap/model";
export type { TreemapPlotProps } from "./treemap/plot";
export { TreemapPlot } from "./treemap/plot";
export type { TreemapTooltipProps } from "./treemap/tooltip";
export { TreemapTooltip } from "./treemap/tooltip";
