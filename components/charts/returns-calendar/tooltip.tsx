"use client";
import { type ReactNode, useMemo, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useReturnsCalendar } from "./context";
import type { ReturnsCalendarCell, ReturnsCalendarTooltipData } from "./types";
import { DOWN, ink, UP } from "./utils";

export function ReturnsCalendarTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: ReturnsCalendarTooltipData) => ReactNode);
  className?: string;
}) {
  const { gridRef, tooltipId, tip, tipValue, tipLabel, tipNote } = useReturnsCalendar();
  const [dismissed, setDismissed] = useState<ReturnsCalendarCell | null>(null);
  const anchorRef = useMemo(
    () => ({
      get current() {
        return tip
          ? (gridRef.current?.querySelector<HTMLElement>(`[data-return-cell="${tip.y}-${tip.m}"]`) ?? null)
          : null;
      },
    }),
    [gridRef, tip],
  );
  const data = { label: tipLabel, value: tipValue, note: tipNote };
  return (
    <Tooltip
      key={tip ? `${tip.y}-${tip.m}` : "closed"}
      open={tip !== null && dismissed !== tip}
      onOpenChange={(open) => {
        if (!open) setDismissed(tip);
      }}
      id={tooltipId}
      anchorRef={anchorRef}
      className={cn("flex items-center gap-1.5", className)}
      content={
        typeof children === "function"
          ? children(data)
          : (children ?? (
              <>
                <span className="text-muted-foreground">{tipLabel}</span>
                <span
                  className="inline-flex items-center font-mono tabular-nums"
                  style={{ color: ink(tipValue >= 0 ? UP : DOWN) }}
                >
                  <NumberTicker
                    value={Math.round(Math.abs(tipValue) * 10)}
                    format={(v) => (v / 10).toFixed(1)}
                    prefix={tipValue >= 0 ? "+" : "−"}
                    suffix="%"
                    duration={0.35}
                    startOnView={false}
                  />
                </span>
                {tipNote ? <span className="text-muted-foreground">{tipNote}</span> : null}
              </>
            ))
      }
    />
  );
}
