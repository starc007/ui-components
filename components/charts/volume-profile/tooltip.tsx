"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useVolumeProfile } from "./context";
import type { VolumeProfileRow } from "./model";

const formatShare = (share: number) => `${share.toFixed(1)}%`;

function TooltipNumber({ value, format }: { value: number; format: (value: number) => string }) {
  return (
    // Keep the short digit tween when composed inside spring-based Tabs.
    <MotionConfig transition={{ type: "tween" }}>
      <NumberTicker
        value={value}
        // NumberTicker rounds its formatter argument; use the original value to
        // preserve fractional prices, volumes and shares in every readout.
        format={() => format(value)}
        startOnView={false}
        duration={0.2}
        stagger={0}
        className="font-mono"
      />
    </MotionConfig>
  );
}

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
    rows,
    active,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    formatPrice,
    formatVolume,
    unit,
  } = useVolumeProfile();
  // Mount the shared pointer tracker only once the plot's anchor exists,
  // including when an initially empty profile receives its first data.
  if (!rows.length) return null;
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      followCursor
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
                  <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                    <TooltipNumber value={active.priceLow} format={formatPrice} />
                    <span>–</span>
                    <TooltipNumber value={active.priceHigh} format={formatPrice} />
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    <TooltipNumber value={active.volume} format={formatVolume} /> {unit}
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span>·</span>
                      <TooltipNumber value={active.share * 100} format={formatShare} />
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
