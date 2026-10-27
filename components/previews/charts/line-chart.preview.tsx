"use client";

import { useEffect, useState } from "react";
import { LineChart, type LineChartSeries } from "@/components/charts/line-chart";
import { Button } from "@/components/motion/button";
import { cn } from "@/lib/utils";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Illustrative revenue lives in the preview. The chart never generates data.
// A seeded generator keeps server and client markup identical.
function makeSeries(seed: number): LineChartSeries[] {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  const walk = (start: number, drift: number) => {
    let value = start;
    return months.map(() => {
      value = Math.max(4, value + drift + (random() - 0.45) * 9);
      return Math.round(value * 10) / 10;
    });
  };
  return [
    { id: "this-year", name: "This year", color: "#2563eb", values: walk(38, 2.4) },
    { id: "last-year", name: "Last year", color: "#a1a1aa", values: walk(32, 1.2) },
    { id: "target", name: "Target", color: "#0d9488", values: months.map((_, i) => 36 + i * 2.5) },
  ];
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-8 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        pressed && "bg-background text-foreground shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

export function LineChartPreview() {
  const [variant, setVariant] = useState<"line" | "area">("area");
  const [seed, setSeed] = useState(7);
  const [loading, setLoading] = useState(false);
  const series = makeSeries(seed);
  // Stand-in for a fetch: show the loading state, then resolve with new data.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setSeed((value) => (value * 48271) % 2147483647);
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <div className="w-full max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Monthly revenue</p>
          <p className="text-xs text-muted-foreground">Demo data, in thousands of dollars</p>
        </div>
        <div className="flex items-center gap-2">
          <fieldset className="flex rounded-lg bg-muted p-0.5">
            <legend className="sr-only">Chart style</legend>
            <Toggle pressed={variant === "line"} onClick={() => setVariant("line")}>
              Line
            </Toggle>
            <Toggle pressed={variant === "area"} onClick={() => setVariant("area")}>
              Area
            </Toggle>
          </fieldset>
          <Button
            variant="ghost"
            size="sm"
            tabIndex={0}
            disabled={loading}
            onClick={() => setSeed((value) => (value * 48271) % 2147483647)}
          >
            New data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            tabIndex={0}
            disabled={loading}
            onClick={() => setLoading(true)}
          >
            Reload
          </Button>
        </div>
      </div>
      <LineChart
        series={series}
        categories={months}
        variant={variant}
        status={loading ? "loading" : "ready"}
        label="Illustrative monthly revenue"
        formatValue={(value) => `$${value.toFixed(1)}K`}
        formatTick={(value) => (value === 0 ? "$0" : `$${value}K`)}
      />
    </div>
  );
}
