"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type Candle, useCandlestickChart } from "./context";

export type CandlestickChartLegendProps = {
  /** Custom readout. Receives the crosshair candle, or the latest one. */
  children?: (candle: Candle, change: number) => ReactNode;
  className?: string;
};

/** OHLC and volume readout that follows the crosshair. */
export function CandlestickChartLegend({
  children,
  className,
}: CandlestickChartLegendProps) {
  const { candles, active, formatPrice, formatVolume } = useCandlestickChart();
  const candle = active !== null ? candles[active] : candles.at(-1);
  if (!candle) return null;
  const change = candle.open
    ? ((candle.close - candle.open) / candle.open) * 100
    : 0;
  if (children) return <>{children(candle, change)}</>;
  const tone =
    change >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  const items: [string, string][] = [
    ["O", formatPrice(candle.open)],
    ["H", formatPrice(candle.high)],
    ["L", formatPrice(candle.low)],
    ["C", formatPrice(candle.close)],
    ["Vol", formatVolume(candle.volume)],
  ];
  return (
    <dl
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums",
        className,
      )}
    >
      <dt className="sr-only">Candle</dt>
      <dd className="text-muted-foreground">{candle.label}</dd>
      {items.map(([term, value]) => (
        <div key={term} className="flex gap-1">
          <dt className="text-muted-foreground">{term}</dt>
          <dd className={term === "Vol" ? undefined : tone}>{value}</dd>
        </div>
      ))}
      <dd className={tone}>
        {change >= 0 ? "+" : "−"}
        {Math.abs(change).toFixed(2)}%
      </dd>
    </dl>
  );
}
