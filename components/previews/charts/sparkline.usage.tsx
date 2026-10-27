"use client";

import { Sparkline } from "@/components/charts/sparkline";

/** A stat card trend. Append or shift values and the line morphs to them. */
export function SparklineExample({ data, labels }: { data: readonly number[]; labels?: readonly string[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <span className="text-xs text-muted-foreground">Revenue</span>
      <Sparkline
        data={data}
        labels={labels}
        label="Revenue, last 30 days"
        variant="area"
        color="#2563eb"
        height={40}
        showDelta
      />
    </div>
  );
}
