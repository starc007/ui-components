"use client";

import { useReducedMotion } from "motion/react";
import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { type CompositionChartMessages, compositionChartMessages } from "./messages";
import { buildComposition, type CompositionSeries } from "./model";

export interface CompositionChartProps {
  /** Parts that stack to 100% in each period, each with a value per period. */
  series: readonly CompositionSeries[];
  /** Unique labels in chronological order. */
  periods: readonly string[];
  /** Draw stacked bars or a stacked area. Default: "bar" */
  view?: "bar" | "area";
  /** The inspected period, for controlled use. */
  period?: string;
  /** The initially inspected period when uncontrolled. Default: the last period */
  defaultPeriod?: string;
  /** Called with the period's label when a different period is inspected. */
  onPeriodChange?: (period: string) => void;
  /** Formats raw values in the legend and tooltip. */
  formatValue?: (value: number) => string;
  /** Accessible name for the chart. Default: "Composition over time" */
  label?: string;
  /** Override any built-in string. */
  labels?: Partial<CompositionChartMessages>;
  /** Classes merged onto the root element. */
  className?: string;
  children?: ReactNode;
}

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
export function useCompositionModel({
  series,
  periods,
  view = "bar",
  period,
  defaultPeriod,
  onPeriodChange,
  formatValue = (value) => number.format(value),
  label: customLabel,
  labels,
}: CompositionChartProps) {
  const t = useMessages("compositionChart", compositionChartMessages, labels);
  const label = customLabel ?? t("label");
  const model = useMemo(() => buildComposition(series, periods), [series, periods]);
  const [internal, setInternal] = useState(defaultPeriod);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const validSeries = (id: string | null) => model.rows.some((row) => row.id === id);
  if (internal !== undefined && !model.columns.some((column) => column.id === internal))
    setInternal(undefined);
  if (pinned !== null && !validSeries(pinned)) setPinned(null);
  if (hovered !== null && !validSeries(hovered)) setHovered(null);
  if (focused !== null && !validSeries(focused)) setFocused(null);
  const selected = period === undefined ? internal : period;
  const found = model.columns.findIndex((column) => column.id === selected);
  const index = found >= 0 ? found : model.columns.length - 1;
  const select = (next: string) => {
    if (period === undefined) setInternal(next);
    if (next !== model.columns[index]?.id) onPeriodChange?.(next);
  };
  const highlight = [hovered, focused, pinned].find((id) => id !== null && validSeries(id)) ?? null;
  return {
    ...model,
    index,
    column: model.columns[index],
    select,
    view,
    label,
    t,
    formatValue,
    pinned,
    setPinned,
    highlight,
    setHovered,
    setFocused,
    reduce: useReducedMotion(),
    canHover: useHoverCapable(),
  };
}

export const CompositionContext = createContext<ReturnType<typeof useCompositionModel> | null>(
  null,
);
export function useCompositionChart() {
  const context = useContext(CompositionContext);
  if (!context)
    throw new Error("Composition chart parts must be rendered inside CompositionChart.");
  return context;
}
