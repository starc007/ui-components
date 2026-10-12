"use client";

import { useState } from "react";
import {
  DonutChart,
  DonutChartCenter,
  DonutChartLegend,
  DonutChartPlot,
  type DonutSegment,
} from "@/components/charts/donut-chart";

// Illustrative figures only.
const SEGMENTS: DonutSegment[] = [
  { id: "team", name: "Team", value: 42_900, color: "#2563eb" },
  { id: "business", name: "Business", value: 31_250, color: "#38bdf8" },
  { id: "enterprise", name: "Enterprise", value: 22_600, color: "#0d9488" },
  { id: "starter", name: "Starter", value: 18_400, color: "#fbbf24" },
];

const usd = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function DonutChartPreview() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="w-full max-w-xl space-y-3">
      <DonutChart
        segments={SEGMENTS}
        formatValue={usd}
        label="Monthly revenue by plan"
        selectedId={selected}
        onSelect={(id) => setSelected((current) => (current === id ? null : id))}
      >
        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,15rem)_1fr]">
          <DonutChartPlot>
            <DonutChartCenter totalLabel="Monthly revenue" />
          </DonutChartPlot>
          <DonutChartLegend />
        </div>
      </DonutChart>
      <p aria-live="polite" className="px-1 text-xs text-muted-foreground">
        {selected
          ? `Filtering by ${SEGMENTS.find((segment) => segment.id === selected)?.name}`
          : "Select a plan to filter"}
      </p>
    </div>
  );
}
