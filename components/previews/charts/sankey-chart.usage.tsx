"use client";

import {
  SankeyChart,
  SankeyChartPlot,
  SankeyChartTooltip,
  type SankeyLink,
  type SankeyNode,
} from "@/components/charts/sankey-chart";

/** Pass nodes and weighted links between their ids; columns follow the flows. */
export function SankeyChartExample({
  nodes,
  links,
}: {
  nodes: readonly SankeyNode[];
  links: readonly SankeyLink[];
}) {
  return (
    <SankeyChart
      nodes={nodes}
      links={links}
      label="Income statement"
      formatValue={(value) => `$${value.toLocaleString("en-US")}M`}
    >
      <SankeyChartPlot className="h-80" />
      <SankeyChartTooltip />
    </SankeyChart>
  );
}
