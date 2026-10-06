"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useTreemap } from "./context";
import type { TreemapItem } from "./model";

export interface TreemapTooltipProps {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  children?: ReactNode | ((item: TreemapItem) => ReactNode);
}

export function TreemapTooltip({ className, side = "top", children }: TreemapTooltipProps) {
  const { active, plotRef, size, tiles, tooltipId, tooltipOpen, setTooltipOpen, formatValue } =
    useTreemap();
  if (!tiles.length) return null;
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      followCursor
      anchorPoint={{
        x: active ? (active.x + active.width / 2) / size.width : 0.5,
        y: active ? (active.y + active.height / 2) / size.height : 0.5,
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
                <MotionConfig transition={{ type: "tween" }}>
                  <span className="flex flex-col gap-1.5 text-xs">
                    {active.path.length > 1 ? (
                      <span className="text-muted-foreground">
                        {active.path.slice(0, -1).join(" / ")}
                      </span>
                    ) : null}
                    <span className="font-medium">{active.label}</span>
                    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                      <NumberTicker
                        value={active.value}
                        format={() => formatValue(active.value)}
                        startOnView={false}
                        duration={0.2}
                        stagger={0}
                      />
                      <span className="text-muted-foreground">·</span>
                      <NumberTicker
                        value={active.share * 100}
                        format={() => `${(active.share * 100).toFixed(1)}%`}
                        startOnView={false}
                        duration={0.2}
                        stagger={0}
                        className="text-muted-foreground"
                      />
                    </span>
                    {active.description ? (
                      <span className="text-muted-foreground">{active.description}</span>
                    ) : null}
                  </span>
                </MotionConfig>
              ))
          : null
      }
    />
  );
}
