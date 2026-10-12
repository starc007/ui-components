"use client";

import { useEffect, useState } from "react";
import {
  type Candle,
  CandlestickChart,
  CandlestickChartLegend,
  CandlestickChartPlot,
} from "@/components/charts/candlestick-chart";
import { Button } from "@/components/motion/button";

// Illustrative candles only. Replace with your exchange's OHLC data.
const STEP = 300;
const START = 12 * 3600;
const label = (seconds: number) =>
  `${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}`;

function seedCandles(count: number): Candle[] {
  const candles: Candle[] = [];
  let close = 2380;
  for (let index = 0; index < count; index++) {
    const open = close;
    close = open * (1 + Math.sin(index * 0.7) * 0.004 + Math.cos(index * 0.23) * 0.003);
    const reach = Math.abs(close - open) * 0.6 + 1.5 + Math.abs(Math.sin(index * 1.9)) * 3;
    const start = START + index * STEP;
    candles.push({
      id: String(start),
      label: label(start),
      open,
      close,
      high: Math.max(open, close) + reach * Math.abs(Math.cos(index * 1.3)),
      low: Math.min(open, close) - reach * Math.abs(Math.sin(index * 0.9)),
      volume: 120 + Math.abs(Math.sin(index * 0.6)) * 420,
    });
  }
  return candles;
}

/** Folds a simulated trade into the live candle; every eighth beat opens a new one. */
function step(candles: Candle[], tick: number): Candle[] {
  const last = candles[candles.length - 1];
  const price = last.close * (1 + Math.sin(tick * 1.7) * 0.0012 + Math.cos(tick * 0.6) * 0.0006);
  const updated = {
    ...last,
    close: price,
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
    volume: last.volume + 12 + Math.abs(Math.sin(tick)) * 30,
  };
  const next = [...candles.slice(0, -1), updated];
  if (tick % 8 !== 0) return next;
  const start = Number(last.id) + STEP;
  return [
    ...next.slice(1),
    { id: String(start), label: label(start), open: price, high: price, low: price, close: price, volume: 0 },
  ];
}

export function CandlestickChartPreview() {
  const [playing, setPlaying] = useState(true);
  const [state, setState] = useState(() => ({ tick: 0, candles: seedCandles(48) }));
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setState(({ tick, candles }) => ({ tick: tick + 1, candles: step(candles, tick + 1) }));
    }, 900);
    return () => window.clearInterval(timer);
  }, [playing]);
  const last = state.candles[state.candles.length - 1];

  return (
    <div className="w-full max-w-3xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          ETH / USD · 5m
          <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-normal uppercase tracking-wider text-muted-foreground">
            Simulated
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPlaying((value) => !value)}>
            {playing ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPlaying(false);
              setState(({ tick, candles }) => ({ tick: tick + 1, candles: step(candles, tick + 1) }));
            }}
          >
            Step
          </Button>
        </div>
      </div>
      <CandlestickChart
        candles={state.candles}
        lastPrice={last?.close}
        label="Simulated ETH / USD, 5 minute candles"
        formatPrice={(value) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      >
        <CandlestickChartLegend />
        <CandlestickChartPlot height={320} className="mt-4" />
      </CandlestickChart>
    </div>
  );
}
