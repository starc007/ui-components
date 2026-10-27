"use client";

import { useReducedMotion } from "motion/react";
import { type ComponentProps, createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { normalizeXY, type XYSeries } from "../xy/model";
import { niceDomain } from "../xy/scale";
import { useControllable, useInspection } from "../xy/use-inspection";

export interface BarChartProps extends Omit<ComponentProps<"section">, "children"> {
  /** Nonnegative values aligned with categories. Missing or negative values leave a gap. */
  series: readonly XYSeries[];
  /** Unique category labels in display order. */
  categories: readonly string[];
  layout?: "grouped" | "stacked";
  orientation?: "vertical" | "horizontal";
  /** Order categories by their visible total. Bars glide to their new place when it changes. */
  sort?: "none" | "ascending" | "descending";
  /** Fixed top of the value axis. Defaults to a rounded value above the tallest bar. */
  max?: number;
  /** Inspected category, by label. */
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Series ids hidden through the legend. */
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (ids: readonly string[]) => void;
  formatValue?: (value: number) => string;
  /** Axis tick labels. Defaults to compact notation (1.2K). */
  formatTick?: (value: number) => string;
  label?: string;
  children?: ReactNode;
}

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const NONE: readonly string[] = [];

export function useBarChartModel({
  series,
  categories,
  layout = "grouped",
  orientation = "vertical",
  sort = "none",
  max,
  activeId,
  defaultActiveId,
  onActiveChange,
  hiddenSeries,
  defaultHiddenSeries = NONE,
  onHiddenSeriesChange,
  formatValue = (value) => number.format(value),
  formatTick = (value) => compact.format(value),
  label = "Bar chart",
}: Omit<BarChartProps, "children">) {
  const data = useMemo(() => normalizeXY(series, categories, { nonnegative: true }), [series, categories]);
  const [hidden, setHidden] = useControllable(hiddenSeries, defaultHiddenSeries, onHiddenSeriesChange);
  const visibleRows = data.rows.filter((row) => !hidden.includes(row.id));
  const [hovered, setHovered] = useState<string | null>(null);
  const highlight = visibleRows.some((row) => row.id === hovered) ? hovered : null;
  const totals = data.categories.map((_, i) =>
    visibleRows.reduce((sum, row) => sum + (row.values[i] ?? 0), 0),
  );
  // Visual order. Ties keep their given order so equal bars never swap places.
  const order = data.categories.map((_, i) => i);
  if (sort !== "none")
    order.sort((a, b) => (sort === "ascending" ? totals[a] - totals[b] : totals[b] - totals[a]) || a - b);
  const domain = niceDomain(
    layout === "stacked"
      ? totals
      : visibleRows.flatMap((row) => row.values.filter((value): value is number => value !== null)),
    { includeZero: true, fixed: max !== undefined && max > 0 ? [0, max] : undefined },
  );
  const inspection = useInspection({
    ids: data.categories,
    activeId,
    defaultActiveId,
    onActiveChange,
  });
  return {
    ...data,
    ...inspection,
    visibleRows,
    totals,
    order,
    hidden,
    toggle: (id: string) =>
      setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]),
    highlight,
    setHovered,
    domain,
    layout,
    orientation,
    formatValue,
    formatTick,
    label,
    reduce: useReducedMotion() ?? false,
    canHover: useHoverCapable(),
  };
}

export type BarChartModel = ReturnType<typeof useBarChartModel>;

export const BarChartContext = createContext<BarChartModel | null>(null);

export function useBarChart() {
  const context = useContext(BarChartContext);
  if (!context) throw new Error("Bar chart parts must be rendered inside BarChart.");
  return context;
}
