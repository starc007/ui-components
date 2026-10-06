"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useStatusBar, type StatusBarDatum, type StatusBarStatus } from "./context";

export interface StatusBarTooltipData {
  datum: StatusBarDatum;
  status: StatusBarStatus;
  index: number;
}

export interface StatusBarTooltipProps {
  children?: ReactNode | ((data: StatusBarTooltipData) => ReactNode);
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function StatusBarTooltip({ children, className, side = "top" }: StatusBarTooltipProps) {
  const { active, activeIndex, rows, plotRef, tooltipId, tooltipOpen, setTooltipOpen } =
    useStatusBar();
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      anchorPoint={{ x: (Math.max(activeIndex, 0) + 0.5) / Math.max(rows.length, 1), y: 0.1 }}
      open={tooltipOpen && active !== null}
      onOpenChange={setTooltipOpen}
      side={side}
      className={cn("max-w-64", className)}
      content={
        active
          ? typeof children === "function"
            ? children({ ...active, index: activeIndex })
            : (children ?? (
                <span className="flex flex-col gap-1">
                  <span className="text-muted-foreground">{active.datum.label}</span>
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: active.status.color }}
                    />
                    {active.status.label}
                  </span>
                  {active.datum.description ? (
                    <span className="text-muted-foreground">{active.datum.description}</span>
                  ) : null}
                </span>
              ))
          : null
      }
    />
  );
}
