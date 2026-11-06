"use client";

import { cn } from "@/lib/utils";
import { type SankeyChartProps, SankeyContext, useSankeyModel } from "./sankey-chart/context";
import { SankeyChartPlot } from "./sankey-chart/plot";
import { SankeyChartTooltip } from "./sankey-chart/tooltip";

/**
 * Weighted flows between nodes, laid out in columns from sources to outcomes.
 * Compose Plot and Tooltip, or omit children for the complete chart.
 *
 * ```tsx
 * <SankeyChart nodes={nodes} links={links} formatValue={usd}>
 *   <SankeyChartPlot />
 *   <SankeyChartTooltip />
 * </SankeyChart>
 * ```
 */
export function SankeyChart({
  nodes,
  links,
  label,
  formatValue,
  colors,
  nodeWidth,
  nodePadding,
  activeId,
  defaultActiveId,
  onActiveChange,
  labels,
  className,
  children,
  ...props
}: SankeyChartProps) {
  const model = useSankeyModel({
    nodes,
    links,
    label,
    formatValue,
    colors,
    nodeWidth,
    nodePadding,
    activeId,
    defaultActiveId,
    onActiveChange,
    labels,
  });
  const { t } = model;
  return (
    <SankeyContext.Provider value={model}>
      <section
        aria-label={model.label}
        {...props}
        data-slot="sankey-chart"
        className={cn("w-full min-w-0", className)}
      >
        {children === undefined ? (
          <>
            <SankeyChartPlot />
            <SankeyChartTooltip />
          </>
        ) : (
          children
        )}
        <div className="sr-only">
          <table>
            <caption>{t("tableCaption", { label: model.label })}</caption>
            <thead>
              <tr>
                <th scope="col">{t("flow")}</th>
                <th scope="col">{t("value")}</th>
                <th scope="col">{t("shareOfSource")}</th>
              </tr>
            </thead>
            <tbody>
              {model.flows.map((flow) => (
                <tr key={flow.id}>
                  <th scope="row">
                    {t("flowRow", { source: flow.source, target: flow.target })}
                  </th>
                  <td>{model.formatValue(flow.value)}</td>
                  <td>{flow.share ? `${(flow.share * 100).toFixed(1)}%` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SankeyContext.Provider>
  );
}

export {
  type SankeyActive,
  type SankeyChartProps,
  useSankeyChart,
} from "./sankey-chart/context";
export { type SankeyChartMessages, sankeyChartMessages } from "./sankey-chart/messages";
export type {
  PlacedLink as SankeyPlacedLink,
  PlacedNode as SankeyPlacedNode,
  SankeyLink,
  SankeyNode,
} from "./sankey-chart/model";
export { SankeyChartPlot, type SankeyChartPlotProps } from "./sankey-chart/plot";
export { SankeyChartTooltip, type SankeyChartTooltipProps } from "./sankey-chart/tooltip";
