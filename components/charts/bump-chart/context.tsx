"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { buildBumpChart, type BumpSeries } from "./model";

export interface BumpChartProps {
  series: readonly BumpSeries[];
  /** Unique period labels, in chronological order. */
  periods: readonly string[];
  /** Pinned series ID. Null clears the selection. */
  active?: string | null;
  defaultActive?: string | null;
  onActiveChange?: (id: string | null) => void;
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function useBumpChartModel({
  series,
  periods,
  active,
  defaultActive = null,
  onActiveChange,
  label = "Rankings over time",
}: BumpChartProps) {
  const model = buildBumpChart(series, periods.length);
  const [internal, setInternal] = useState(defaultActive);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const valid = (id: string | null) => id != null && model.rows.some((row) => row.id === id);
  // Clear removed identities in this render so reappearing data cannot revive them.
  if (internal !== null && !valid(internal)) setInternal(null);
  if (hovered !== null && !valid(hovered)) setHovered(null);
  if (focused !== null && !valid(focused)) setFocused(null);
  const selected = active === undefined ? internal : active;
  const pinned = valid(selected) ? selected : null;
  const highlighted = valid(hovered) ? hovered : valid(focused) ? focused : pinned;
  const select = (id: string | null) => {
    if (active === undefined) setInternal(id);
    onActiveChange?.(id);
  };
  return {
    ...model,
    periods,
    label,
    pinned,
    highlighted,
    select,
    setHovered,
    setFocused,
    reduce: useReducedMotion(),
    canHover: useHoverCapable(),
  };
}

export const BumpChartContext = createContext<ReturnType<typeof useBumpChartModel> | null>(null);
export function useBumpChart() {
  const context = useContext(BumpChartContext);
  if (!context) throw new Error("Bump chart parts must be rendered inside BumpChart.");
  return context;
}
