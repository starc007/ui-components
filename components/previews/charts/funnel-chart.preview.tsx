"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { Button } from "@/components/motion/button";

const labels = ["Visitors", "Signed up", "Activated", "Started trial", "Subscribed"];
const cohorts = [
  [24000, 15600, 10800, 7200, 4320],
  [28000, 18200, 13650, 9100, 6370],
  [22000, 13200, 7920, 4752, 2376],
];
export function FunnelChartPreview() {
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [cohort, setCohort] = useState(0);
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">From first visit to first payment</h3>
          <p className="mt-1 text-xs text-muted-foreground">Product conversion · Sample cohorts</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setCohort((value) => (value + 1) % cohorts.length)}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Next cohort
        </Button>
      </div>
      <fieldset
        aria-label="Funnel direction"
        className="inline-flex gap-1 rounded-full bg-muted/50 p-1"
      >
        {(["vertical", "horizontal"] as const).map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            aria-pressed={direction === value}
            onClick={() => setDirection(value)}
            className={direction === value ? "bg-background shadow-sm" : "text-muted-foreground"}
          >
            {value === "vertical" ? "Vertical" : "Horizontal"}
          </Button>
        ))}
      </fieldset>
      <FunnelChart
        direction={direction}
        stages={labels.map((label, index) => ({ id: label, label, value: cohorts[cohort][index] }))}
      />
      <p className="text-center text-[11px] text-muted-foreground">
        Inspect a stage to see conversion and drop-off
      </p>
    </div>
  );
}
