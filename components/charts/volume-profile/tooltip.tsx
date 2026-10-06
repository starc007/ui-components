"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useVolumeProfile } from "./context";
import type { VolumeProfileRow } from "./model";

export interface VolumeProfileTooltipProps {
  children?: ReactNode | ((row: VolumeProfileRow) => ReactNode);
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function VolumeProfileTooltip({
  children,
  className,
  side = "top",
}: VolumeProfileTooltipProps) {
  const {
    active,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    formatPrice,
    formatVolume,
    unit,
  } = useVolumeProfile();
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      anchorPoint={{
        x: active ? Math.max(0.1, active.proportion / 2) : 0.5,
        y: active?.center ?? 0.5,
      }}
      open={tooltipOpen && active !== null}
      onOpenChange={setTooltipOpen}
      side={side}
      className={cn("max-w-64", className)}
      content={
        active
          ? typeof children === "function"
            ? children(active)
            : (children ?? (
                <span className="flex flex-col gap-1.5 text-xs">
                  <span className="font-mono font-medium tabular-nums">
                    {formatPrice(active.priceLow)} – {formatPrice(active.priceHigh)}
                  </span>
                  <span>
                    {formatVolume(active.volume)} {unit}{" "}
                    <span className="text-muted-foreground">
                      · {(active.share * 100).toFixed(1)}%
                    </span>
                  </span>
                  {active.isPoc || active.inValueArea ? (
                    <span className="text-muted-foreground">
                      {active.isPoc ? "Point of control" : "Inside value area"}
                    </span>
                  ) : null}
                </span>
              ))
          : null
      }
    />
  );
}
