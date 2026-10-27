export interface XYSeries {
  /** Stable, unique identity. Keep it when updating values so marks morph in place. */
  id: string;
  name: string;
  /** Any CSS color, including theme variables. */
  color: string;
  /** Values aligned with categories. Missing or non-finite values leave a gap. */
  values: readonly (number | null)[];
}

export type XYRow = Omit<XYSeries, "values"> & { values: (number | null)[] };

/** First of repeated series and category ids wins. Invalid values become gaps, never zeros. */
export function normalizeXY(
  series: readonly XYSeries[],
  categories: readonly string[],
  { nonnegative = false }: { nonnegative?: boolean } = {},
) {
  const columns: { id: string; source: number }[] = [];
  const seenColumns = new Set<string>();
  categories.forEach((id, source) => {
    if (seenColumns.has(id)) return;
    seenColumns.add(id);
    columns.push({ id, source });
  });
  const seenRows = new Set<string>();
  const rows: XYRow[] = [];
  for (const { values, ...row } of series) {
    if (seenRows.has(row.id)) continue;
    seenRows.add(row.id);
    rows.push({
      ...row,
      values: columns.map(({ source }) => {
        const value = values[source];
        return typeof value === "number" && Number.isFinite(value) && (!nonnegative || value >= 0)
          ? value
          : null;
      }),
    });
  }
  return { rows, categories: columns.map((column) => column.id) };
}
