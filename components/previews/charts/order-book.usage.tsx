"use client";

import {
  OrderBook,
  OrderBookBalance,
  OrderBookDepthSummary,
  OrderBookHeader,
  type OrderBookLevel,
  OrderBookSide,
  OrderBookSpread,
} from "@/components/charts/order-book";

/** Pass fresh aggregated snapshots from your data source to animate the depth.
 * Hover or focus a level to total the depth up to it; onLevelSelect makes prices clickable. */
export function OrderBookExample({
  bids,
  asks,
  onPriceSelect,
}: {
  bids: readonly OrderBookLevel[];
  asks: readonly OrderBookLevel[];
  onPriceSelect?: (price: number) => void;
}) {
  return (
    <OrderBook
      bids={bids}
      asks={asks}
      baseSymbol="SOL"
      quoteSymbol="USD"
      levels={9}
      onLevelSelect={onPriceSelect ? (level) => onPriceSelect(level.price) : undefined}
    >
      <OrderBookHeader />
      <OrderBookSide side="ask" />
      <OrderBookSpread />
      <OrderBookSide side="bid" />
      <OrderBookDepthSummary />
      <OrderBookBalance />
    </OrderBook>
  );
}
