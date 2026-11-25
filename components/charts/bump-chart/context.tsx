"use client";

import { useReducedMotion } from "motion/react";
import { createContext, type ReactNode, useContext, useState } from "react";
import { useControllable } from "@/lib/hooks/use-controllable";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { type BumpChartMessages, bumpChartMessages } from "./messages";
import { type BumpSeries, buildBumpChart } from "./model";

export interface BumpChartProps {
  /** Lines to draw, each with one rank per period. Duplicate ids are dropped. */
  series: readonly BumpSeries[];
  /** Unique period labels, in chronological order. */
  periods: readonly string[];
  /** Pinned series ID. Null clears the selection. */
  active?: string | null;
  /** The initial pinned series id when uncontrolled. Default: null */
  defaultActive?: string | null;
  /** Called with the series id, or null, when the pinned series changes. */
  onActiveChange?: (id: string | null) => void;
  /** Accessible name for the chart. Default: "Rankings over time" */
  label?: string;
  /** Override any built-in string. */
  labels?: Partial<BumpChartMessages>;
  children?: ReactNode;
  /** Classes merged onto the root element. */
  className?: string;
}

export function useBumpChartModel({
  series,
  periods,
  active,
  defaultActive = null,
  onActiveChange,
  label,
  labels,
}: BumpChartProps) {
  const t = useMessages("bumpChart", bumpChartMessages, labels);
  const model = buildBumpChart(series, periods.length);
  const [selected, select, setInternal] = useControllable<string | null>(
    active,
    defaultActive,
    onActiveChange,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const valid = (id: string | null) => id != null && model.rows.some((row) => row.id === id);
  // Clear removed identities in this render so reappearing data cannot revive them.
  if (active === undefined && selected !== null && !valid(selected)) setInternal(null);
  if (hovered !== null && !valid(hovered)) setHovered(null);
  if (focused !== null && !valid(focused)) setFocused(null);
  const pinned = valid(selected) ? selected : null;
  const highlighted = valid(hovered) ? hovered : valid(focused) ? focused : pinned;
  return {
    ...model,
    periods,
    label: label ?? t("label"),
    t,
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
