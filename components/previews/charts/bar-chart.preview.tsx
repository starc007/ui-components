"use client";

import { type ReactNode, useState } from "react";
import { BarChart, type BarChartSeries } from "@/components/charts/bar-chart";
import { Button } from "@/components/motion/button";
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

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex rounded-lg bg-muted p-0.5">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-8 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            value === option.value && "bg-background text-foreground shadow-sm",
          )}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
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
          <Segmented
            label="Layout"
            value={layout}
            onChange={setLayout}
            options={[
              { value: "grouped", label: "Grouped" },
              { value: "stacked", label: "Stacked" },
            ]}
          />
          <Segmented
            label="Orientation"
            value={orientation}
            onChange={setOrientation}
            options={[
              { value: "vertical", label: "Vertical" },
              { value: "horizontal", label: "Horizontal" },
            ]}
          />
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
