"use client";

import { useEffect, useState } from "react";
import {
  OrderBook,
  OrderBookBalance,
  OrderBookHeader,
  OrderBookSide,
  OrderBookSpread,
} from "@/components/charts/order-book";
import { Button } from "@/components/motion/button";

// Illustrative snapshots only. Replace with your exchange's aggregated price levels.
const askSizes = [284, 574, 363, 278, 1800, 2200, 1100, 1200, 782];
const bidSizes = [194, 543, 314, 592, 715, 744, 789, 735, 1100];
function snapshot(tick: number) {
  const side = (sizes: number[], direction: number) =>
    sizes.map((size, index) => {
      // Update one third of the levels per beat; unchanged quotes keep their identity.
      const phase = (index + (direction === 1 ? 1 : 0)) % 3;
      const lastUpdate = tick - ((tick + phase) % 3);
      return {
        price: Number((245.85 + direction * (index + 1) * 0.15).toFixed(2)),
        size:
          lastUpdate <= 0
            ? size
            : Math.round(size * (1 + Math.sin(lastUpdate * 1.3 + index * 2.1 + direction) * 0.32)),
      };
    });
  return { asks: side(askSizes, 1), bids: side(bidSizes, -1) };
}

export function OrderBookPreview() {
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setTick((value) => value + 1);
    }, 950);
    return () => window.clearInterval(timer);
  }, [playing]);
  const book = snapshot(tick);
  return (
    <div className="w-full max-w-[520px] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          SOL / USD
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
              setTick((value) => value + 1);
            }}
          >
            Step
          </Button>
        </div>
      </div>
      <OrderBook
        {...book}
        baseSymbol="SOL"
        quoteSymbol="USD"
        label="Simulated SOL / USD order book"
      >
        <OrderBookHeader />
        <OrderBookSide side="ask" />
        <OrderBookSpread />
        <OrderBookSide side="bid" />
        <OrderBookBalance />
      </OrderBook>
    </div>
  );
}
