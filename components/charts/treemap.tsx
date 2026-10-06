"use client";

import { cn } from "@/lib/utils";
import { TreemapContext, useTreemapModel, type TreemapProps } from "./treemap/context";
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
  });
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
            <caption>{model.label} data</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Value</th>
                <th scope="col">Share of total</th>
                <th scope="col">Details</th>
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

export { useTreemap } from "./treemap/context";
export type { TreemapProps } from "./treemap/context";
export type {
  TreemapNode,
  TreemapLeaf,
  TreemapGroup,
  TreemapItem,
  TreemapTile,
} from "./treemap/model";
export { TreemapPlot } from "./treemap/plot";
export type { TreemapPlotProps } from "./treemap/plot";
export { TreemapTooltip } from "./treemap/tooltip";
export type { TreemapTooltipProps } from "./treemap/tooltip";
export { TreemapLegend } from "./treemap/legend";
export type { TreemapLegendProps } from "./treemap/legend";
