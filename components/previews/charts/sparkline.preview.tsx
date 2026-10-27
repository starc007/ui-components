"use client";

import { useState } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { Button } from "@/components/motion/button";

// Illustrative metrics live in the preview. A seeded generator keeps server and
// client markup identical; "Add sample" shifts each window like a live feed.
function walk(seed: number, length: number, start: number, drift: number, noise: number) {
  let state = seed;
  let value = start;
  return Array.from({ length }, () => {
    state = (state * 16807) % 2147483647;
    value = Math.max(0, value + drift + (state / 2147483647 - 0.5) * noise);
    return Math.round(value * 100) / 100;
  });
}

const days = Array.from({ length: 60 }, (_, i) =>
  new Date(Date.UTC(2026, 8, 1 + i)).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }),
);
const WINDOW = 30;
const revenue = walk(14, 60, 42, 0.6, 7);
const users = walk(49, 60, 1800, 4, 160);
const errors = walk(49, 60, 2.4, -0.03, 0.5);

const money = (value: number) => `$${value.toFixed(1)}K`;

export function SparklinePreview() {
  const [offset, setOffset] = useState(0);
  const slice = <T,>(values: readonly T[]) => values.slice(offset, offset + WINDOW);
  const cards = [
    { id: "revenue", title: "Revenue", value: money(slice(revenue).at(-1) ?? 0), data: slice(revenue), color: "#2563eb", format: money },
    {
      id: "users",
      title: "Active users",
      value: Math.round(slice(users).at(-1) ?? 0).toLocaleString("en"),
      data: slice(users),
      color: "#0d9488",
      format: (value: number) => Math.round(value).toLocaleString("en"),
    },
    {
      id: "errors",
      title: "Error rate",
      value: `${(slice(errors).at(-1) ?? 0).toFixed(2)}%`,
      data: slice(errors),
      color: "#e11d48",
      format: (value: number) => `${value.toFixed(2)}%`,
      // Fewer errors is good news.
      invertDelta: true,
    },
  ];
  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Last 30 days, demo data</span>
        <Button
          variant="ghost"
          size="sm"
          tabIndex={0}
          disabled={offset >= days.length - WINDOW}
          onClick={() => setOffset((value) => Math.min(days.length - WINDOW, value + 1))}
        >
          Add sample
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-muted-foreground">{card.title}</span>
              <span className="font-mono text-sm font-medium tabular-nums">{card.value}</span>
            </div>
            <Sparkline
              data={card.data}
              labels={slice(days)}
              label={`${card.title}, last 30 days`}
              variant="area"
              color={card.color}
              height={40}
              showDelta
              invertDelta={"invertDelta" in card}
              formatValue={card.format}
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs text-muted-foreground">Interactive: hover, drag or use the arrow keys</p>
        <Sparkline
          data={slice(users)}
          labels={slice(days)}
          label="Active users, last 30 days"
          color="#0d9488"
          height={48}
          strokeWidth={2}
          interactive
          formatValue={cards[1].format}
        />
      </div>
    </div>
  );
}
