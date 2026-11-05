/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const compositionChartMessages = {
  label: "Composition over time",
  empty: "No composition data",
  noData: "No data",
  inspect: "Inspect period",
  highlight: "Highlight {name}",
  missingValue: "Missing value",
  incomplete: "No complete data for this period.",
};

export type CompositionChartMessages = typeof compositionChartMessages;
