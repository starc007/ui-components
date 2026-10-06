"use client";

import {
  VolumeProfile,
  VolumeProfilePlot,
  VolumeProfileSummary,
  VolumeProfileTooltip,
  type VolumeProfileBin,
} from "@/components/charts/volume-profile";

/** Aggregate your executed trades into non-overlapping price ranges upstream.
 * Keep each range's ID stable to morph its bar when volume changes.
 * valueArea is a target: whole bins can cover less, and the POC is always included. */
export function VolumeProfileExample({ data }: { data: readonly VolumeProfileBin[] }) {
  return (
    <VolumeProfile
      data={data}
      label="BTC volume profile"
      unit="BTC"
      valueArea={0.7}
      formatPrice={(price) => `$${price.toLocaleString("en-US")}`}
      formatVolume={(volume) => volume.toLocaleString("en-US", { maximumFractionDigits: 4 })}
    >
      <VolumeProfilePlot />
      <VolumeProfileTooltip />
      <VolumeProfileSummary />
    </VolumeProfile>
  );
}
