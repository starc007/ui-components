export type DepthLevel = { price: number; size: number; total: number };
type Level = { price: number; size: number };

function prepare(levels: readonly Level[], side: "bid" | "ask", limit: number): DepthLevel[] {
  const prices = new Map<number, number>();
  for (const { price, size } of levels) {
    if (!Number.isFinite(price) || !Number.isFinite(size) || price <= 0 || size <= 0) continue;
    prices.set(price, (prices.get(price) ?? 0) + size);
  }
  let total = 0;
  return [...prices]
    .sort(([a], [b]) => (side === "bid" ? b - a : a - b))
    .slice(0, limit)
    .map(([price, size]) => {
      total += size;
      return { price, size, total };
    });
}

export type DepthSummary = {
  side: "bid" | "ask";
  /** Number of levels from the best price out to the inspected one. */
  levels: number;
  /** Total base size across those levels. */
  size: number;
  /** Total quote value across those levels. */
  quote: number;
  /** Size-weighted average fill price. */
  averagePrice: number;
};

/** Totals levels ordered from the best price outward. */
export function summarizeDepth(levels: readonly DepthLevel[], side: "bid" | "ask"): DepthSummary {
  const size = levels.reduce((sum, level) => sum + level.size, 0);
  const quote = levels.reduce((sum, level) => sum + level.size * level.price, 0);
  return { side, levels: levels.length, size, quote, averagePrice: size ? quote / size : 0 };
}

/** Accumulate from the best quote outward before reversing asks for display. */
export function buildOrderBook(bids: readonly Level[], asks: readonly Level[], levels: number) {
  const limit = Number.isFinite(levels) ? Math.max(0, Math.floor(levels)) : 9;
  const buy = prepare(bids, "bid", limit);
  const sell = prepare(asks, "ask", limit);
  const bidTotal = buy.at(-1)?.total ?? 0;
  const askTotal = sell.at(-1)?.total ?? 0;
  const bestBid = buy[0]?.price;
  const bestAsk = sell[0]?.price;
  const midpoint = bestBid == null || bestAsk == null ? null : (bestBid + bestAsk) / 2;
  const spread = bestBid == null || bestAsk == null ? null : bestAsk - bestBid;
  return {
    bids: buy,
    asks: sell,
    bidTotal,
    askTotal,
    maxTotal: Math.max(bidTotal, askTotal),
    midpoint,
    spread,
  };
}
