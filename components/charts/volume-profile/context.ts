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
import { buildVolumeProfile, type VolumeProfileBin } from "./model";

const formatNumber = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export interface VolumeProfileProps extends ComponentProps<"section"> {
  /** Already-aggregated executed volume. Sorted by price; unequal bins and gaps are supported. */
  data: readonly VolumeProfileBin[];
  label?: string;
  unit?: string;
  formatPrice?: (price: number) => string;
  formatVolume?: (volume: number) => string;
  /** Target fraction, default 0.7. Whole bins may cover less; the POC is always included.
   * Set false to hide the value area. Equal-volume POCs favor the lower price. */
  valueArea?: number | false;
  color?: string;
  pocColor?: string;
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
}

export function useVolumeProfileModel({
  data,
  label = "Volume profile",
  unit = "units",
  formatPrice = formatNumber,
  formatVolume = formatNumber,
  valueArea = 0.7,
  color = "#6366f1",
  pocColor = "#f59e0b",
  activeId,
  defaultActiveId = null,
  onActiveChange,
}: VolumeProfileProps) {
  const model = useMemo(() => buildVolumeProfile(data, valueArea), [data, valueArea]);
  const [internalId, setInternalId] = useState(defaultActiveId);
  if (internalId !== null && !model.rows.some((row) => row.id === internalId)) setInternalId(null);
  const requestedId = activeId === undefined ? internalId : activeId;
  const activeIndex = model.rows.findIndex((row) => row.id === requestedId);
  const active = model.rows[activeIndex] ?? null;
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
  const describe = (row: (typeof model.rows)[number]) =>
    [
      `${formatPrice(row.priceLow)} to ${formatPrice(row.priceHigh)}`,
      `${formatVolume(row.volume)} ${unit}`,
      `${(row.share * 100).toFixed(1)}% of total volume`,
      row.isPoc ? "Point of control" : row.inValueArea ? "Inside value area" : null,
    ]
      .filter(Boolean)
      .join(". ");
  return {
    ...model,
    label,
    unit,
    formatPrice,
    formatVolume,
    color,
    pocColor,
    describe,
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

export const VolumeProfileContext = createContext<ReturnType<typeof useVolumeProfileModel> | null>(
  null,
);

export function useVolumeProfile() {
  const context = useContext(VolumeProfileContext);
  if (!context) throw new Error("Volume profile parts must be rendered inside VolumeProfile.");
  return context;
}
