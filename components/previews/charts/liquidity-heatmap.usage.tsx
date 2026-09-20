"use client";

import {
  LiquidityHeatmap,
  LiquidityHeatmapLegend,
  LiquidityHeatmapPlot,
  type LiquiditySnapshot,
} from "@/components/charts/liquidity-heatmap";

/** Supply time-ordered snapshots with consistent price buckets and stable IDs. */
export function LiquidityHeatmapExample({
  snapshots,
}: {
  snapshots: readonly LiquiditySnapshot[];
}) {
  return (
    <LiquidityHeatmap snapshots={snapshots} unit="SOL" maxSize={2400}>
      <LiquidityHeatmapPlot />
      <LiquidityHeatmapLegend />
    </LiquidityHeatmap>
  );
}
