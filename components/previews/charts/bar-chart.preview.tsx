"use client";

import { useState } from "react";
import { BarChart, type BarChartSeries } from "@/components/charts/bar-chart";
import { Button } from "@/components/motion/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { cn } from "@/lib/utils";

const regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"];

// Illustrative revenue lives in the preview. The chart never generates data.
// A seeded generator keeps server and client markup identical.
function makeSeries(seed: number): BarChartSeries[] {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  const scale = [1, 0.85, 0.7, 0.4, 0.3, 0.2];
  const row = (base: number) => regions.map((_, i) => Math.round(base * scale[i] * (0.55 + random())));
  return [
    { id: "subscriptions", name: "Subscriptions", color: "#2563eb", values: row(120) },
    { id: "services", name: "Services", color: "#38bdf8", values: row(70) },
    { id: "marketplace", name: "Marketplace", color: "#0d9488", values: row(45) },
  ];
}


export function BarChartPreview() {
  const [layout, setLayout] = useState<"grouped" | "stacked">("grouped");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [sorted, setSorted] = useState(false);
  const [seed, setSeed] = useState(11);
  return (
    <div className="w-full max-w-3xl space-y-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Revenue by region</p>
          <p className="text-xs text-muted-foreground">Demo data, in thousands of dollars</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={layout}
            onValueChange={(value) => setLayout(value as "grouped" | "stacked")}
            variant="pill"
          >
            <TabsList aria-label="Layout" wrapperClassName="w-auto">
              <TabsTrigger
                value="grouped"
                indicatorClassName="bg-background"
                className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
              >Grouped</TabsTrigger>
              <TabsTrigger
                value="stacked"
                indicatorClassName="bg-background"
                className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
              >Stacked</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            value={orientation}
            onValueChange={(value) => setOrientation(value as "vertical" | "horizontal")}
            variant="pill"
          >
            <TabsList aria-label="Orientation" wrapperClassName="w-auto">
              <TabsTrigger
                value="vertical"
                indicatorClassName="bg-background"
                className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
              >Vertical</TabsTrigger>
              <TabsTrigger
                value="horizontal"
                indicatorClassName="bg-background"
                className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
              >Horizontal</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="sm"
            tabIndex={0}
            aria-pressed={sorted}
            onClick={() => setSorted((value) => !value)}
            className={cn(sorted && "bg-muted text-foreground")}
          >
            Sort by total
          </Button>
          <Button
            variant="ghost"
            size="sm"
            tabIndex={0}
            onClick={() => setSeed((value) => (value * 48271) % 2147483647)}
          >
            New data
          </Button>
        </div>
      </div>
      <BarChart
        key={orientation}
        series={makeSeries(seed)}
        categories={regions}
        layout={layout}
        orientation={orientation}
        sort={sorted ? "descending" : "none"}
        label="Illustrative revenue by region"
        formatValue={(value) => `$${value}K`}
        formatTick={(value) => (value === 0 ? "$0" : `$${value}K`)}
      />
    </div>
  );
}
