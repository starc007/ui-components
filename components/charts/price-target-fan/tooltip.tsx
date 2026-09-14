"use client";

import { type ReactNode, useState } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { usePriceTargetFan } from "./context";
import { H, ink, W } from "./utils";

export function PriceTargetFanTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: NonNullable<ReturnType<typeof usePriceTargetFan>["overlay"]>) => ReactNode);
  className?: string;
}) {
  const { svgRef, tooltipId, overlay } = usePriceTargetFan();
  const [dismissed, setDismissed] = useState<typeof overlay>(null);
  return (
    <Tooltip
      open={overlay !== null && dismissed !== overlay}
      onOpenChange={(open) => { if (!open) setDismissed(overlay); }}
      id={tooltipId}
      anchorRef={svgRef}
      anchorPoint={{ x: (overlay?.px ?? 0) / W, y: (overlay?.py ?? 0) / H }}
      className={cn("w-[148px]", className)}
      content={overlay &&
        (typeof children === "function"
          ? children(overlay)
          : (children ?? (
              <>
                <span className="block text-[10px] text-muted-foreground">{overlay.title}</span>
                <span className="mt-1.5 flex flex-col gap-1">
                  {overlay.metrics.map((metric) => (
                    <span key={metric.label} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-foreground">{metric.label}</span>
                      <span className="font-mono tabular-nums text-foreground">{metric.value}</span>
                    </span>
                  ))}
                </span>
                {overlay.accent ? (
                  <span className="mt-1.5 flex items-center justify-between gap-3 border-t border-border pt-1.5 text-xs">
                    <span className="font-medium text-foreground">{overlay.accent.label}</span>
                    <span className="font-mono tabular-nums" style={{ color: ink(overlay.accent.color) }}>
                      {overlay.accent.value}
                    </span>
                  </span>
                ) : null}
              </>
            )))}
    />
  );
}
