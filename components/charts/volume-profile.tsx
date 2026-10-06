"use client";

import { cn } from "@/lib/utils";
import {
  VolumeProfileContext,
  useVolumeProfileModel,
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
            <caption>{model.label} data</caption>
            <thead>
              <tr>
                <th scope="col">Price range</th>
                <th scope="col">Volume ({model.unit})</th>
                <th scope="col">Share</th>
                <th scope="col">Level</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">
                    {model.formatPrice(row.priceLow)} to {model.formatPrice(row.priceHigh)}
                  </th>
                  <td>{model.formatVolume(row.volume)}</td>
                  <td>{(row.share * 100).toFixed(1)}%</td>
                  <td>
                    {row.isPoc
                      ? "Point of control"
                      : row.inValueArea
                        ? "Inside value area"
                        : model.valueArea
                          ? "Outside value area"
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

export { useVolumeProfile } from "./volume-profile/context";
export type { VolumeProfileProps } from "./volume-profile/context";
export type { VolumeProfileBin, VolumeProfileRow } from "./volume-profile/model";
export { VolumeProfilePlot } from "./volume-profile/plot";
export type { VolumeProfilePlotProps } from "./volume-profile/plot";
export { VolumeProfileSummary } from "./volume-profile/summary";
export { VolumeProfileTooltip } from "./volume-profile/tooltip";
export type { VolumeProfileTooltipProps } from "./volume-profile/tooltip";
