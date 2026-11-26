"use client";

import { useReducedMotion } from "motion/react";
import { type ComponentProps, createContext, useContext, useMemo } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { useInspection } from "../xy/use-inspection";
import { type VolumeProfileMessages, volumeProfileMessages } from "./messages";
import { buildVolumeProfile, type VolumeProfileBin } from "./model";

const formatNumber = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export interface VolumeProfileProps extends ComponentProps<"section"> {
  /** Already-aggregated executed volume. Sorted by price; unequal bins and gaps are supported. */
  data: readonly VolumeProfileBin[];
  /** Chart name, used in its accessible labels. Default: "Volume profile" */
  label?: string;
  /** Volume unit shown after amounts. Default: "units" */
  unit?: string;
  /** Formats prices in the plot, tooltip and summary. Defaults to up to 2 decimals. */
  formatPrice?: (price: number) => string;
  /** Formats volume amounts in the tooltip and summary. Defaults to up to 2 decimals. */
  formatVolume?: (volume: number) => string;
  /** Target fraction, default 0.7. Whole bins may cover less; the POC is always included.
   * Set false to hide the value area. Equal-volume POCs favor the lower price. */
  valueArea?: number | false;
  /** Bar color for regular price levels. Default: "#0285f7" */
  color?: string;
  /** Color for the point of control bar and its marker. Default: "#f59e0b" */
  pocColor?: string;
  /** Id of the inspected bin, or null for none, for controlled use. */
  activeId?: string | null;
  /** Id of the bin inspected at first when uncontrolled. Default: null */
  defaultActiveId?: string | null;
  /** Called with the bin id when inspection moves, or null when it clears. */
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
  color = "#0285f7",
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
  const {
    activeIndex,
    setActive,
    open: tooltipOpen,
    setOpen: setTooltipOpen,
    plotRef,
    tooltipId,
  } = useInspection({
    ids: model.rows.map((row) => row.id),
    activeId,
    defaultActiveId,
    onActiveChange,
  });
  const active = model.rows[activeIndex] ?? null;
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
