export interface BumpSeries {
  id: string;
  name: string;
  /** One rank per period, starting at 1. Null leaves a gap in the path. */
  ranks: readonly (number | null)[];
  color?: string;
}

export const BUMP_COLORS = ["#8b5cf6", "#0d9488", "#f59e0b", "#3b82f6", "#f43f5e", "#a3a33a"];
export const PLOT = { width: 560, left: 32, right: 100, top: 28, bottom: 36, rowHeight: 44 };

export function buildBumpChart(series: readonly BumpSeries[], periodCount: number) {
  const seen = new Set<string>();
  const rows = series
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    })
    .map((row, index) => ({
      ...row,
      color: row.color ?? BUMP_COLORS[index % BUMP_COLORS.length],
      ranks: Array.from({ length: periodCount }, (_, i) => {
        const rank = row.ranks[i];
        return rank != null && Number.isSafeInteger(rank) && rank > 0 ? rank : null;
      }),
    }));
  const ranks = [
    ...new Set(rows.flatMap((row) => row.ranks.filter((rank): rank is number => rank != null))),
  ].sort((a, b) => a - b);
  const maxRank = ranks.at(-1) ?? 1;
  // Preserve numeric rank distances, including skipped ranks, without unbounded chart height.
  const plotHeight = Math.max(1, Math.min(maxRank - 1, 8)) * PLOT.rowHeight;
  const height = PLOT.top + plotHeight + PLOT.bottom;
  const x = (index: number) =>
    periodCount <= 1
      ? (PLOT.left + PLOT.width - PLOT.right) / 2
      : PLOT.left + (index / (periodCount - 1)) * (PLOT.width - PLOT.left - PLOT.right);
  const y = (rank: number) =>
    maxRank === 1
      ? PLOT.top + plotHeight / 2
      : PLOT.top + ((rank - 1) / (maxRank - 1)) * plotHeight;
  return { rows, ranks, maxRank, height, x, y };
}

/** Missing periods break the path rather than inventing continuity. */
export function bumpPath(
  ranks: readonly (number | null)[],
  x: (i: number) => number,
  y: (rank: number) => number,
) {
  let path = "";
  let previous: { x: number; y: number } | null = null;
  ranks.forEach((rank, index) => {
    if (rank == null) {
      previous = null;
      return;
    }
    const point = { x: x(index), y: y(rank) };
    if (previous) {
      const middle = (previous.x + point.x) / 2;
      path += ` C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
    } else path += ` M ${point.x} ${point.y}`;
    previous = point;
  });
  return path.trim();
}
