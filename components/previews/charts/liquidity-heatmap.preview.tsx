"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/motion/button";
import { LiquidityHeatmap, type LiquiditySnapshot } from "@/components/charts/liquidity-heatmap";

// Deterministic illustrative order-book history; no market feed is implied.
function snapshots(phase: number): LiquiditySnapshot[] {
  return Array.from({ length: 24 }, (_, time) => ({
    id: `minute-${time}`,
    label: `14:${String(time * 2).padStart(2, "0")}`,
    price: 245.5 + Math.sin(time * 0.27 + phase * 0.4) * 1.2 + time * 0.035,
    levels: Array.from({ length: 18 }, (_, row) => {
      const price = 250 - row * 0.5;
      const shelf =
        Math.exp(-((row - 4 - Math.sin(time * 0.18 + phase) * 0.7) ** 2) / 0.8) +
        Math.exp(-((row - 13 + Math.cos(time * 0.15 + phase) * 0.8) ** 2) / 1.2);
      const noise = (Math.sin(row * 12.9 + time * 7.3 + phase * 2.1) + 1) / 2;
      return {
        price,
        size: Math.round(90 + noise * 350 + shelf * (1500 + Math.sin(time * 0.3 + phase) * 450)),
      };
    }),
  }));
}
export function LiquidityHeatmapPreview() {
  const [phase, setPhase] = useState(0);
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">Where liquidity rests</h3>
          <p className="mt-1 text-xs text-muted-foreground">SOL / USD · Simulated depth</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setPhase((value) => value + 1)}
        >
          <RefreshCw aria-hidden="true" className="size-3.5" />
          Resimulate
        </Button>
      </div>
      <LiquidityHeatmap
        snapshots={snapshots(phase)}
        maxSize={2400}
        unit="SOL"
        formatPrice={(price) => `$${price.toFixed(2)}`}
      />
      <p className="text-center text-[11px] text-muted-foreground">
        Brighter bands hold more liquidity · White line tracks price
      </p>
    </div>
  );
}
