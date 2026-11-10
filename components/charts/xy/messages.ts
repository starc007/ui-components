import type { useMessages } from "@/lib/i18n";

/**
 * Strings shared by LineChart, BarChart and Sparkline. English defaults;
 * override per instance through each chart's `labels`, or app-wide with
 * `LocaleProvider` under the `xyChart` namespace.
 */
export const xyChartMessages = {
  noData: "No data",
  /** Inline value for a missing sample in spoken text. */
  missing: "no data",
  dataCaption: "{label} data",
  category: "Category",
  total: "Total",
  series: "Series",
  seriesValue: "{name} {value}",
  totalValue: "Total {value}",
};

export type XYChartMessages = typeof xyChartMessages;

export type XYChartT = ReturnType<typeof useMessages<XYChartMessages>>;
