/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const sankeyChartMessages = {
  label: "Sankey chart",
  tableCaption: "{label} data",
  flow: "Flow",
  value: "Value",
  shareOfSource: "Share of source",
  flowRow: "{source} to {target}",
  nodes: "{label} nodes",
  nodeFlows: "in {in}, out {out}",
  tooltipFlows: "In {in} · Out {out}",
  from: "From",
  to: "To",
  more: "{count} more",
  linkShare: "{share} of {source}",
  noFlows: "No flows to show",
  empty: "No sankey data",
};

export type SankeyChartMessages = typeof sankeyChartMessages;
