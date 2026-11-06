"use client";

import { cn } from "@/lib/utils";
import {
  useVolumeProfileModel,
  VolumeProfileContext,
  type VolumeProfileProps,
} from "./volume-profile/context";
import { VolumeProfilePlot } from "./volume-profile/plot";
import { VolumeProfileSummary } from "./volume-profile/summary";
import { VolumeProfileTooltip } from "./volume-profile/tooltip";

/** Compose Plot, Tooltip and Summary, or omit children for the complete chart. */
export function VolumeProfile({
  data,
  label,
  unit,
  formatPrice,
  formatVolume,
  valueArea,
  color,
  pocColor,
  activeId,
  defaultActiveId,
  onActiveChange,
  labels,
  className,
  children,
  ...props
}: VolumeProfileProps) {
  const model = useVolumeProfileModel({
    data,
    label,
    unit,
    formatPrice,
    formatVolume,
    valueArea,
    color,
    pocColor,
    activeId,
    defaultActiveId,
    onActiveChange,
    labels,
  });
  return (
    <VolumeProfileContext.Provider value={model}>
      <section
        aria-label={model.label}
        {...props}
        data-slot="volume-profile"
        className={cn("min-w-0 w-full space-y-5", className)}
      >
        {children === undefined ? (
          <>
            <VolumeProfilePlot />
            <VolumeProfileTooltip />
            <VolumeProfileSummary />
          </>
        ) : (
          children
        )}
        <div className="sr-only">
          <table>
            <caption>{model.t("caption", { label: model.label })}</caption>
            <thead>
              <tr>
                <th scope="col">{model.t("priceRange")}</th>
                <th scope="col">{model.t("volume", { unit: model.unit })}</th>
                <th scope="col">{model.t("share")}</th>
                <th scope="col">{model.t("level")}</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">
                    {model.t("range", {
                      low: model.formatPrice(row.priceLow),
                      high: model.formatPrice(row.priceHigh),
                    })}
                  </th>
                  <td>{model.formatVolume(row.volume)}</td>
                  <td>{(row.share * 100).toFixed(1)}%</td>
                  <td>
                    {row.isPoc
                      ? model.t("poc")
                      : row.inValueArea
                        ? model.t("inside")
                        : model.valueArea
                          ? model.t("outside")
                          : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </VolumeProfileContext.Provider>
  );
}

export type { VolumeProfileProps } from "./volume-profile/context";
export { useVolumeProfile } from "./volume-profile/context";
export { type VolumeProfileMessages, volumeProfileMessages } from "./volume-profile/messages";
export type { VolumeProfileBin, VolumeProfileRow } from "./volume-profile/model";
export type { VolumeProfilePlotProps } from "./volume-profile/plot";
export { VolumeProfilePlot } from "./volume-profile/plot";
export { VolumeProfileSummary } from "./volume-profile/summary";
export type { VolumeProfileTooltipProps } from "./volume-profile/tooltip";
export { VolumeProfileTooltip } from "./volume-profile/tooltip";
