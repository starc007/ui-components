"use client";

import {
  OrderBook,
  OrderBookBalance,
  OrderBookHeader,
  OrderBookSide,
  OrderBookSpread,
  type OrderBookLevel,
} from "@/components/charts/order-book";

/** Pass fresh aggregated snapshots from your data source to animate the depth. */
export function OrderBookExample({
  bids,
  asks,
}: {
  bids: readonly OrderBookLevel[];
  asks: readonly OrderBookLevel[];
}) {
  return (
    <OrderBook bids={bids} asks={asks} baseSymbol="SOL" quoteSymbol="USD" levels={9}>
      <OrderBookHeader />
      <OrderBookSide side="ask" />
      <OrderBookSpread />
      <OrderBookSide side="bid" />
      <OrderBookBalance />
    </OrderBook>
  );
}
