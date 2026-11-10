"use client";

import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { type VolumeProfileMessages, volumeProfileMessages } from "./messages";
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
  /** Override any built-in string. */
  labels?: Partial<VolumeProfileMessages>;
}

export function useVolumeProfileModel({
  data,
  label: labelProp,
  unit: unitProp,
  formatPrice = formatNumber,
  formatVolume = formatNumber,
  valueArea = 0.7,
  color = "#6366f1",
  pocColor = "#f59e0b",
  activeId,
  defaultActiveId = null,
  onActiveChange,
  labels,
}: VolumeProfileProps) {
  const t = useMessages("volumeProfile", volumeProfileMessages, labels);
  const label = labelProp ?? t("label");
  const unit = unitProp ?? t("unit");
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
      t("range", { low: formatPrice(row.priceLow), high: formatPrice(row.priceHigh) }),
      t("amount", { volume: formatVolume(row.volume), unit }),
      t("shareOfTotal", { share: `${(row.share * 100).toFixed(1)}%` }),
      row.isPoc ? t("poc") : row.inValueArea ? t("inside") : null,
    ]
      .filter(Boolean)
      .join(". ");
  return {
    ...model,
    label,
    unit,
    t,
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
