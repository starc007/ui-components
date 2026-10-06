"use client";

import { useId, useState, type KeyboardEvent } from "react";
import {
  Treemap,
  TreemapLegend,
  TreemapPlot,
  TreemapTooltip,
  type TreemapNode,
} from "@/components/charts/treemap";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Illustrative portfolio values only. Real values are supplied by the consumer.
const groups = [
  { id: "technology", label: "Technology", color: "#3454b5", companies: ["AAPL", "MSFT", "NVDA"] },
  { id: "healthcare", label: "Healthcare", color: "#087e6c", companies: ["LLY", "UNH", "JNJ"] },
  { id: "finance", label: "Finance", color: "#7c3db5", companies: ["JPM", "V", "BAC"] },
  { id: "energy", label: "Energy", color: "#a35318", companies: ["XOM", "CVX", "SHEL"] },
] as const;
const quarters = [
  { id: "q1", label: "Q1", values: [210, 190, 130, 128, 85, 45, 80, 95, 30, 74, 62, 44] },
  { id: "q2", label: "Q2", values: [170, 220, 175, 108, 50, 60, 90, 75, 56, 68, 69, 34] },
  { id: "q3", label: "Q3", values: [260, 205, 155, 100, 95, 46, 140, 150, 0, 40, 50, 25] },
] as const;
const data: Record<string, readonly TreemapNode[]> = Object.fromEntries(
  quarters.map((quarter) => [
    quarter.id,
    groups.map((group, i) => ({
      id: group.id,
      label: group.label,
      color: group.color,
      children: group.companies.map((company, j) => ({
        id: company,
        label: company,
        value: quarter.values[i * 3 + j] * 1000,
      })),
    })),
  ]),
);
const formatValue = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });

export function TreemapPreview() {
  const [quarter, setQuarter] = useState("q1");
  const id = useId();
  const panelId = `${id}-treemap`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLButtonElement) || event.target.getAttribute("role") !== "tab")
      return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const current = tabs.indexOf(event.target);
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + direction + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].focus();
    const value = tabs[next].dataset.tabsValue;
    if (value) setQuarter(value);
  };
  return (
    <div className="w-full max-w-2xl min-w-0 py-2">
      <Tabs value={quarter} onValueChange={setQuarter}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Portfolio allocation</p>
            <p className="text-xs text-muted-foreground">Demo data</p>
          </div>
          <TabsList
            aria-label="Portfolio quarter"
            onKeyDown={onKeyDown}
            wrapperClassName="w-auto"
            className="bg-muted"
          >
            {quarters.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                id={`${id}-${item.id}`}
                aria-controls={panelId}
                tabIndex={quarter === item.id ? 0 : -1}
                indicatorClassName="bg-background"
                className="min-h-8 px-3 py-1.5 text-xs [&_[data-tabs-label]]:text-foreground"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div id={panelId} role="tabpanel" aria-labelledby={`${id}-${quarter}`}>
          <Treemap data={data[quarter]} label="Portfolio allocation" formatValue={formatValue}>
            <TreemapPlot className="h-72 sm:h-80" />
            <TreemapTooltip />
            <TreemapLegend />
          </Treemap>
        </div>
      </Tabs>
    </div>
  );
}
