"use client";

import { BumpChart, BumpChartLegend, BumpChartPlot } from "@/components/charts/bump-chart";

const periods = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
// Illustrative product rankings; replace these with your own period-by-period ranks.
const series = [
  { id: "studio", name: "Studio", ranks: [4, 3, 2, 3, 2, 1], color: "#8b5cf6" },
  { id: "canvas", name: "Canvas", ranks: [1, 1, 3, 2, 1, 2], color: "#0d9488" },
  { id: "layers", name: "Layers", ranks: [3, 2, 1, 1, 3, 3], color: "#f59e0b" },
  { id: "orbit", name: "Orbit", ranks: [2, 4, 5, 4, 5, 4], color: "#3b82f6" },
  { id: "frame", name: "Frame", ranks: [5, 5, 4, 5, 4, 5], color: "#f43f5e" },
];

export function BumpChartPreview() {
  return (
    <div className="w-full max-w-[600px] space-y-6">
      <div className="flex items-baseline justify-between gap-4 px-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">The leaderboard</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Five products. Six months. Every move.
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Apr — Sep
        </span>
      </div>
      <BumpChart
        series={series}
        periods={periods}
        label="Illustrative product rankings, April to September"
      >
        <BumpChartPlot />
        <BumpChartLegend />
      </BumpChart>
      <p className="text-center text-[11px] text-muted-foreground">
        Inspect a dot for details · Select to pin a product
      </p>
    </div>
  );
}
