"use client";

import { cn } from "@/lib/utils";
import { SankeyContext, type SankeyChartProps, useSankeyModel } from "./sankey-chart/context";
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
  });
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
            <caption>{model.label} data</caption>
            <thead>
              <tr>
                <th scope="col">Flow</th>
                <th scope="col">Value</th>
                <th scope="col">Share of source</th>
              </tr>
            </thead>
            <tbody>
              {model.flows.map((flow) => (
                <tr key={flow.id}>
                  <th scope="row">
                    {flow.source} to {flow.target}
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
export type {
  PlacedLink as SankeyPlacedLink,
  PlacedNode as SankeyPlacedNode,
  SankeyLink,
  SankeyNode,
} from "./sankey-chart/model";
export { SankeyChartPlot, type SankeyChartPlotProps } from "./sankey-chart/plot";
export { SankeyChartTooltip, type SankeyChartTooltipProps } from "./sankey-chart/tooltip";
