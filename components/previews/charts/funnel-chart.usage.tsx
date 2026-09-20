"use client";

import {
  FunnelChart,
  FunnelChartPlot,
  FunnelChartSummary,
  type FunnelStage,
} from "@/components/charts/funnel-chart";

export function FunnelChartExample({ stages }: { stages: readonly FunnelStage[] }) {
  return (
    <FunnelChart stages={stages} direction="vertical" unit="people">
      <FunnelChartPlot />
      <FunnelChartSummary />
    </FunnelChart>
  );
}
