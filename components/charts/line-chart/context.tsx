"use client";

import { useReducedMotion } from "motion/react";
import { type ComponentProps, createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { normalizeXY, type XYSeries } from "../xy/model";
import type { XYCurve } from "../xy/path";
import { niceDomain } from "../xy/scale";
import { useControllable, useInspection } from "../xy/use-inspection";

export interface LineChartProps extends Omit<ComponentProps<"section">, "children"> {
  series: readonly XYSeries[];
  /** Unique x-axis labels in display order. Values align with them by index. */
  categories: readonly string[];
  /** `area` fills each line down to zero with a fading gradient. */
  variant?: "line" | "area";
  curve?: XYCurve;
  /** Fixed value-axis bounds. Defaults to rounded bounds around the visible series. */
  domain?: readonly [number, number];
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
  /**
   * `loading` hides the lines behind a pulsing placeholder until your data
   * arrives; switching to `ready` hands off to the draw-in. Keep one chart
   * mounted across both states.
   */
  status?: "ready" | "loading";
  /** Shown over the placeholder while loading. An empty string hides it. */
  loadingLabel?: string;
  children?: ReactNode;
}

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const NONE: readonly string[] = [];

export function useLineChartModel({
  series,
  categories,
  variant = "line",
  curve = "monotone",
  domain: fixedDomain,
  activeId,
  defaultActiveId,
  onActiveChange,
  hiddenSeries,
  defaultHiddenSeries = NONE,
  onHiddenSeriesChange,
  formatValue = (value) => number.format(value),
  formatTick = (value) => compact.format(value),
  label = "Line chart",
  status = "ready",
  loadingLabel = "Loading data",
}: Omit<LineChartProps, "children">) {
  // The plot area hosts the tooltip panel, and its measured size places it.
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState({ width: 0, height: 0 });
  const data = useMemo(() => normalizeXY(series, categories), [series, categories]);
  const [hidden, setHidden] = useControllable(hiddenSeries, defaultHiddenSeries, onHiddenSeriesChange);
  const visibleRows = data.rows.filter((row) => !hidden.includes(row.id));
  const [hovered, setHovered] = useState<string | null>(null);
  const highlight = visibleRows.some((row) => row.id === hovered) ? hovered : null;
  // Hiding a series rescales the axis to what is left, and every mark springs there.
  const domain = niceDomain(
    visibleRows.flatMap((row) => row.values.filter((value): value is number => value !== null)),
    { includeZero: variant === "area", fixed: fixedDomain },
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
    hidden,
    toggle: (id: string) =>
      setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]),
    highlight,
    setHovered,
    domain,
    variant,
    curve,
    formatValue,
    formatTick,
    label,
    status,
    loading: status === "loading",
    loadingLabel,
    overlay,
    setOverlay,
    geometry,
    setGeometry,
    reduce: useReducedMotion() ?? false,
    canHover: useHoverCapable(),
  };
}

export type LineChartModel = ReturnType<typeof useLineChartModel>;

export const LineChartContext = createContext<LineChartModel | null>(null);

export function useLineChart() {
  const context = useContext(LineChartContext);
  if (!context) throw new Error("Line chart parts must be rendered inside LineChart.");
  return context;
}
