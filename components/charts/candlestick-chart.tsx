"use client";

import { cn } from "@/lib/utils";
import {
  type CandlestickChartProps,
  CandlestickContext,
  useCandlestickModel,
} from "./candlestick-chart/context";
import { CandlestickChartLegend } from "./candlestick-chart/legend";
import { CandlestickChartPlot } from "./candlestick-chart/plot";

/**
 * OHLC candles with volume, a last-price line, and a crosshair readout.
 *
 * ```tsx
 * <CandlestickChart candles={candles} lastPrice={last} formatPrice={usd}>
 *   <CandlestickChartLegend />
 *   <CandlestickChartPlot height={360} />
 * </CandlestickChart>
 * ```
 */
export function CandlestickChart({
  className,
  children,
  ...props
}: CandlestickChartProps) {
  const model = useCandlestickModel(props);
  return (
    <CandlestickContext.Provider value={model}>
      <div className={cn("w-full", className)}>
        {children ?? (
          <div className="grid gap-3">
            <CandlestickChartLegend />
            <CandlestickChartPlot />
          </div>
        )}
      </div>
    </CandlestickContext.Provider>
  );
}

export {
  type Candle,
  type CandlestickChartProps,
  useCandlestickChart,
} from "./candlestick-chart/context";
export {
  CandlestickChartLegend,
  type CandlestickChartLegendProps,
} from "./candlestick-chart/legend";
export {
  CandlestickChartPlot,
  type CandlestickChartPlotProps,
} from "./candlestick-chart/plot";
