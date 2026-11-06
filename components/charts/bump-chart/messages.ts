export const bumpChartMessages = {
  label: "Rankings over time",
  empty: "No rankings yet",
  plot: "{label} plot, scroll horizontally for more periods",
  description:
    "Ranks run from best at the top to lowest at the bottom. Use the legend to highlight or pin a series. Exact values follow in a table.",
  caption: "{label} — exact ranks",
  series: "Series",
  noData: "No data",
  highlight: "Highlight {name}",
  changeUnavailable: "Change unavailable",
  unchanged: "Unchanged",
  noPrevious: "No previous rank",
  noChange: "No change",
  upOne: "Up 1 place",
  up: "Up {count} places",
  downOne: "Down 1 place",
  down: "Down {count} places",
  previously: "Previously #{rank} in {period}",
  point: "{name}, {period}: rank {rank}",
};
export type BumpChartMessages = typeof bumpChartMessages;
