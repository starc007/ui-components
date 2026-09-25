export interface CompositionSeries {
  id: string;
  name: string;
  color: string;
  /** Nonnegative values aligned with periods. Missing/invalid values leave a gap. */
  values: readonly (number | null)[];
}

export function buildComposition(series: readonly CompositionSeries[], periods: readonly string[]) {
  const seen = new Set<string>();
  const rows = series.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
  const periodIds = new Set<string>();
  const columns = periods.flatMap((id, index) => {
    if (periodIds.has(id)) return [];
    periodIds.add(id);
    const values = rows.map((row) => row.values[index]);
    const valid =
      values.length > 0 &&
      values.every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0);
    // Scale before summing so large finite input values cannot overflow shares.
    const max = valid ? Math.max(0, ...values.map((v) => v ?? 0)) : 0;
    const scaledTotal = max > 0 ? values.reduce<number>((sum, v) => sum + (v ?? 0) / max, 0) : 0;
    let offset = 0;
    const segments = rows.map((row, i) => {
      const value = values[i] ?? null;
      const share = scaledTotal > 0 ? ((value ?? 0) / max / scaledTotal) * 100 : 0;
      const segment = { ...row, value, share, offset };
      offset += share;
      return segment;
    });
    return [{ id, valid: valid && scaledTotal > 0, segments }];
  });
  return { rows, columns };
}

/** Separate polygons for contiguous runs; unknown periods never become interpolated data. */
export function compositionArea(
  columns: ReturnType<typeof buildComposition>["columns"],
  row: number,
) {
  const paths: string[] = [];
  let run: number[] = [];
  const flush = () => {
    if (!run.length) return;
    const top = run.map((index) => {
      const segment = columns[index].segments[row];
      return `${((index + 0.5) / columns.length) * 100},${100 - segment.offset - segment.share}`;
    });
    const bottom = [...run]
      .reverse()
      .map(
        (index) =>
          `${((index + 0.5) / columns.length) * 100},${100 - columns[index].segments[row].offset}`,
      );
    // A single sample gets a column-width footprint instead of an invisible polygon.
    if (run.length === 1) {
      const index = run[0];
      const segment = columns[index].segments[row];
      const left = (index / columns.length) * 100;
      const right = ((index + 1) / columns.length) * 100;
      paths.push(
        `M${left},${100 - segment.offset} L${left},${100 - segment.offset - segment.share} L${right},${100 - segment.offset - segment.share} L${right},${100 - segment.offset} Z`,
      );
    } else paths.push(`M${top.join(" L")} L${bottom.join(" L")} Z`);
    run = [];
  };
  columns.forEach((column, index) => {
    if (column.valid) run.push(index);
    else flush();
  });
  flush();
  return paths.join(" ");
}
