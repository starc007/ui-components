"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

export interface StatusBarDatum {
  /** Stable, unique identity. Keep it when updating a period's status. */
  id: string;
  /** Consumer-formatted period, date, or event label. */
  label: string;
  /** Must match an ID in statuses. */
  status: string;
  description?: string;
}

export interface StatusBarStatus {
  id: string;
  label: string;
  /** Any CSS color, including theme variables. */
  color: string;
}

export const STATUS_BAR_STATUSES: readonly StatusBarStatus[] = [
  { id: "operational", label: "Operational", color: "#059669" },
  { id: "degraded", label: "Degraded", color: "#d97706" },
  { id: "outage", label: "Outage", color: "#e11d48" },
  { id: "maintenance", label: "Maintenance", color: "#2563eb" },
  { id: "unknown", label: "No data", color: "var(--muted-foreground)" },
];

export interface StatusBarProps extends ComponentProps<"section"> {
  /** Observations in display order. The chart never generates or aggregates data. */
  data: readonly StatusBarDatum[];
  /** Override the default status labels and colors, or define your own states. */
  statuses?: readonly StatusBarStatus[];
  label?: string;
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
}

export function useStatusBarModel({
  data,
  statuses = STATUS_BAR_STATUSES,
  label = "Status history",
  activeId,
  defaultActiveId = null,
  onActiveChange,
}: StatusBarProps) {
  const rows = useMemo(() => {
    const states = new Map<string, StatusBarStatus>();
    for (const status of statuses) {
      if (states.has(status.id)) throw new Error(`StatusBar: duplicate status ID "${status.id}".`);
      states.set(status.id, status);
    }
    const ids = new Set<string>();
    return data.map((datum) => {
      if (ids.has(datum.id)) throw new Error(`StatusBar: duplicate period ID "${datum.id}".`);
      ids.add(datum.id);
      const status = states.get(datum.status);
      if (!status) throw new Error(`StatusBar: define the status "${datum.status}" in statuses.`);
      return { datum, status };
    });
  }, [data, statuses]);
  const [internalId, setInternalId] = useState(defaultActiveId);
  // Resolve stale identities during render so returning periods never revive a cursor.
  if (internalId !== null && !rows.some(({ datum }) => datum.id === internalId))
    setInternalId(null);
  const requestedId = activeId === undefined ? internalId : activeId;
  const activeIndex = rows.findIndex(({ datum }) => datum.id === requestedId);
  const active = rows[activeIndex] ?? null;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const latest = useRef({ activeId, requestedId, onActiveChange });
  useLayoutEffect(() => {
    latest.current = { activeId, requestedId, onActiveChange };
  });
  const setActive = useCallback((id: string | null) => {
    const current = latest.current;
    if (current.activeId === undefined) setInternalId(id);
    if (current.requestedId !== id) current.onActiveChange?.(id);
  }, []);
  return {
    rows,
    statuses,
    label,
    active,
    activeIndex,
    setActive,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    reduce: useReducedMotion(),
    canHover: useHoverCapable(),
  };
}

export const StatusBarContext = createContext<ReturnType<typeof useStatusBarModel> | null>(null);

export function useStatusBar() {
  const context = useContext(StatusBarContext);
  if (!context) throw new Error("Status bar parts must be rendered inside StatusBar.");
  return context;
}
