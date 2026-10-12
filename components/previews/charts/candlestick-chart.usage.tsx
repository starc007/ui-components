"use client";

import {
  type Candle,
  CandlestickChart,
  CandlestickChartLegend,
  CandlestickChartPlot,
} from "@/components/charts/candlestick-chart";

/** Pass candles oldest first with stable ids. Update the last candle as trades
 * print and append a new one when its interval opens. */
export function CandlestickChartExample({
  candles,
  lastPrice,
}: {
  candles: readonly Candle[];
  lastPrice?: number;
}) {
  return (
    <CandlestickChart
      candles={candles}
      lastPrice={lastPrice}
      label="ETH / USD, 5 minute candles"
      formatPrice={(value) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    >
      <CandlestickChartLegend />
      <CandlestickChartPlot height={320} className="mt-4" />
    </CandlestickChart>
  );
}
