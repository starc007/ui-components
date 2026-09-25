"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { buildComposition, type CompositionSeries } from "./model";

export interface CompositionChartProps {
  series: readonly CompositionSeries[];
  /** Unique labels in chronological order. */
  periods: readonly string[];
  view?: "bar" | "area";
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  formatValue?: (value: number) => string;
  label?: string;
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
  label = "Composition over time",
}: CompositionChartProps) {
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
