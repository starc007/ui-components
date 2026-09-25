"use client";

import { CompositionChart } from "@/components/charts/composition-chart";

const periods = Array.from({ length: 36 }, (_, index) =>
  new Date(Date.UTC(2026, 7, index + 1)).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }),
);
// Illustrative acquisition data. The library itself never generates observations.
const series = [
  { id: "organic", name: "Organic search", color: "#2563eb", base: 46, trend: -0.45 },
  { id: "direct", name: "Direct", color: "#38bdf8", base: 24, trend: 0.12 },
  { id: "referral", name: "Referrals", color: "#0d9488", base: 10, trend: 0.32 },
  { id: "social", name: "Social", color: "#fbbf24", base: 12, trend: 0.06 },
  { id: "email", name: "Email", color: "#a78bfa", base: 5, trend: 0.09 },
  { id: "other", name: "Other", color: "#a1a1aa", base: 3, trend: 0.02 },
].map(({ base, trend, ...row }, i) => ({
  ...row,
  values: periods.map((_, day) =>
    Math.round((base + day * trend + Math.sin(day * 1.7 + i * 2) * Math.min(base / 3, 5)) * 120),
  ),
}));

function CompositionPreview({ view }: { view: "bar" | "area" }) {
  return (
    <CompositionChart
      view={view}
      series={series}
      periods={periods}
      label="Illustrative acquisition channel shares"
      formatValue={(value) => `${value.toLocaleString("en")} visits`}
    />
  );
}

export function CompositionChartPreview() {
  return (
    <div className="w-full space-y-10">
      <CompositionPreview view="bar" />
      <div className="border-t border-border pt-10">
        <CompositionPreview view="area" />
      </div>
    </div>
  );
}
