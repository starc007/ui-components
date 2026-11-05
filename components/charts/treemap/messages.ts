/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const treemapMessages = {
  label: "Treemap",
  tableCaption: "{label} data",
  item: "Item",
  value: "Value",
  share: "Share of total",
  details: "Details",
  legend: "Treemap legend",
  tiles: "Treemap tiles",
  ofTotal: "{share}% of total",
  noPositive: "No positive values",
  empty: "No treemap data",
};

export type TreemapMessages = typeof treemapMessages;
