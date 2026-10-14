"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { buildDonut, type DonutSegment } from "./model";

export interface DonutChartProps {
  segments: readonly DonutSegment[];
  /** Ring thickness in viewBox units; the chart is 200 wide. */
  thickness?: number;
  /** Degrees of empty space between neighbouring segments. */
  gap?: number;
  /** Focused segment, shared by the ring, center, and legend. Controlled. */
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Called when a legend item is clicked. */
  onSelect?: (id: string) => void;
  /** Marks a legend item as pressed. */
  selectedId?: string | null;
  formatValue?: (value: number) => string;
  /** Accessible name for the chart. */
  label?: string;
  className?: string;
  children?: ReactNode;
}

const defaultFormat = (value: number) => value.toLocaleString("en-US");

export function useDonutModel({
  segments,
  thickness = 22,
  gap = 3,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  onSelect,
  selectedId = null,
  formatValue = defaultFormat,
  label = "Donut chart",
}: DonutChartProps) {
  const reduce = useReducedMotion() ?? false;
  const canHover = useHoverCapable();
  const radius = 100 - thickness / 2 - 8;
  const { placed, total } = buildDonut(segments, { radius, thickness, gap });

  const [internal, setInternal] = useState(defaultActiveId);
  const raw = activeId === undefined ? internal : activeId;
  // Resolve during render by id; a segment that left the data clears focus.
  const active = raw !== null && placed.some((segment) => segment.id === raw) ? raw : null;

  const latest = useRef({ controlled: activeId !== undefined, onActiveChange });
  useLayoutEffect(() => {
    latest.current = { controlled: activeId !== undefined, onActiveChange };
  });
  const setActive = useCallback((id: string | null) => {
    if (!latest.current.controlled) setInternal(id);
    latest.current.onActiveChange?.(id);
  }, []);

  return {
    placed,
    total,
    radius,
    thickness,
    active,
    setActive,
    onSelect,
    selectedId,
    formatValue,
    label,
    reduce,
    canHover,
  };
}

export type DonutModel = ReturnType<typeof useDonutModel>;
export const DonutContext = createContext<DonutModel | null>(null);

export function useDonutChart() {
  const model = useContext(DonutContext);
  if (!model) throw new Error("Donut chart parts must be rendered inside DonutChart.");
  return model;
}
