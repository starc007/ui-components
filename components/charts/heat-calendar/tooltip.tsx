"use client";
import { type ReactNode, useMemo, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useHeatCalendar } from "./context";
import { fmtDay, fmtRange } from "./utils";

export function HeatCalendarTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: NonNullable<ReturnType<typeof useHeatCalendar>["tooltip"]>) => ReactNode);
  className?: string;
}) {
  const { gridRef, tooltipId, tip, tooltip, unit } = useHeatCalendar();
  const [dismissed, setDismissed] = useState<typeof tip>(null);
  const anchorRef = useMemo(() => ({ get current() {
    return tip ? gridRef.current?.querySelector<HTMLElement>(`[data-heat-cell="${tip.w}-${tip.d}"]`) ?? null : null;
  }}), [gridRef, tip]);
  return (
    <Tooltip
      key={tip ? `${tip.w}-${tip.d}` : "closed"}
      open={tooltip !== null && dismissed !== tip}
      onOpenChange={(open) => { if (!open) setDismissed(tip); }}
      id={tooltipId}
      anchorRef={anchorRef}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      content={tooltip &&
        (typeof children === "function"
          ? children(tooltip)
          : (children ?? (
              <>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <NumberTicker
                    value={tooltip.days > 1 ? tooltip.total : tooltip.count}
                    duration={0.35}
                    startOnView={false}
                  />{" "}
                  {unit}
                </span>
                <span className="text-muted-foreground">
                  {tooltip.days > 1 && tooltip.startDate && tooltip.endDate
                    ? `${fmtRange.format(tooltip.startDate)} – ${fmtRange.format(tooltip.endDate)}`
                    : fmtDay.format(tooltip.date)}
                </span>
                {tooltip.days > 1 ? <span className="text-muted-foreground">{tooltip.days} days</span> : null}
              </>
            )))}
    />
  );
}
