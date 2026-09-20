export interface LiquiditySnapshot {
  /** Stable identity, usually an ISO timestamp. */
  id: string;
  label: string;
  levels: readonly { price: number; size: number }[];
  price?: number;
}

/** Invalid observations are omitted; zero size is distinct from missing data. */
export function buildLiquidityHeatmap(snapshots: readonly LiquiditySnapshot[]) {
  const seen = new Set<string>();
  const columns = snapshots
    .filter((snapshot) => {
      if (seen.has(snapshot.id)) return false;
      seen.add(snapshot.id);
      return true;
    })
    .map((snapshot) => {
      const levels = new Map<number, number>();
      for (const { price, size } of snapshot.levels) {
        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(size) || size < 0) continue;
        const total = (levels.get(price) ?? 0) + size;
        if (Number.isFinite(total)) levels.set(price, total);
      }
      return { ...snapshot, levels };
    });
  const prices = [...new Set(columns.flatMap((column) => [...column.levels.keys()]))].sort(
    (a, b) => b - a,
  );
  let maximum = 0;
  for (const column of columns)
    for (const size of column.levels.values()) maximum = Math.max(maximum, size);
  return { columns, prices, maximum };
}

/** Price levels are discrete bands; interpolate the trace between their centers. */
export function pricePosition(price: number, prices: readonly number[]) {
  if (
    !Number.isFinite(price) ||
    !prices.length ||
    price > prices[0] ||
    price < prices[prices.length - 1]
  )
    return null;
  for (let index = 0; index < prices.length - 1; index++) {
    if (price <= prices[index] && price >= prices[index + 1]) {
      return index + 0.5 + (prices[index] - price) / (prices[index] - prices[index + 1]);
    }
  }
  return prices.length - 0.5;
}
