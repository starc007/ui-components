"use client";

import { useState } from "react";
import {
  SankeyChart,
  type SankeyLink,
  type SankeyNode,
} from "@/components/charts/sankey-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Illustrative figures for a made-up company, in millions of dollars.
const NODES: SankeyNode[] = [
  { id: "subscriptions", label: "Subscriptions", color: "#2563eb" },
  { id: "services", label: "Services", color: "#38bdf8" },
  { id: "marketplace", label: "Marketplace", color: "#6366f1" },
  { id: "revenue", label: "Revenue", color: "#64748b" },
  { id: "cost", label: "Cost of revenue", color: "#e11d48" },
  { id: "gross", label: "Gross profit", color: "#0d9488" },
  { id: "rnd", label: "R&D", color: "#f59e0b" },
  { id: "sales", label: "Sales & marketing", color: "#fb923c" },
  { id: "admin", label: "G&A", color: "#fbbf24" },
  { id: "operating", label: "Operating profit", color: "#16a34a" },
];

const flows = (v: Record<string, number>): SankeyLink[] => [
  { source: "subscriptions", target: "revenue", value: v.subscriptions },
  { source: "services", target: "revenue", value: v.services },
  { source: "marketplace", target: "revenue", value: v.marketplace },
  { source: "revenue", target: "cost", value: v.cost },
  {
    source: "revenue",
    target: "gross",
    value: v.subscriptions + v.services + v.marketplace - v.cost,
  },
  { source: "gross", target: "rnd", value: v.rnd },
  { source: "gross", target: "sales", value: v.sales },
  { source: "gross", target: "admin", value: v.admin },
  {
    source: "gross",
    target: "operating",
    value:
      v.subscriptions + v.services + v.marketplace - v.cost - v.rnd - v.sales - v.admin,
  },
];

const QUARTERS = {
  q2: flows({ subscriptions: 62, services: 18, marketplace: 10, cost: 34, rnd: 20, sales: 16, admin: 7 }),
  q3: flows({ subscriptions: 70, services: 17, marketplace: 14, cost: 36, rnd: 22, sales: 17, admin: 7 }),
};

const usd = (value: number) => `$${value.toLocaleString("en-US")}M`;

export function SankeyChartPreview() {
  const [quarter, setQuarter] = useState<keyof typeof QUARTERS>("q3");
  return (
    <div className="w-full max-w-3xl space-y-4">
      <Tabs
        value={quarter}
        onValueChange={(value) => setQuarter(value as keyof typeof QUARTERS)}
        variant="segment"
      >
        <TabsList>
          <TabsTrigger value="q2">Q2</TabsTrigger>
          <TabsTrigger value="q3">Q3</TabsTrigger>
        </TabsList>
      </Tabs>
      <SankeyChart
        nodes={NODES}
        links={QUARTERS[quarter]}
        formatValue={usd}
        label={`Income statement, ${quarter.toUpperCase()}`}
      />
    </div>
  );
}
