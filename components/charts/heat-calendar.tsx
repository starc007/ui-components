"use client";

import { cn } from "@/lib/utils";
import { HeatCalendarContext, useHeatCalendarModel } from "./heat-calendar/context";
import { HeatCalendarGrid } from "./heat-calendar/grid";
import { HeatCalendarLegend } from "./heat-calendar/legend";
import { HeatCalendarTooltip } from "./heat-calendar/tooltip";
import type { HeatCalendarProps } from "./heat-calendar/types";

/** Compose Grid, Tooltip and Legend, or omit children for the complete chart. */
export function HeatCalendar({ children, className, ...props }: HeatCalendarProps) {
  const model = useHeatCalendarModel(props);
  return (
    <HeatCalendarContext.Provider value={model}>
      <div className={cn("w-fit max-w-full", className)}>
        {children === undefined ? (
          <>
            <HeatCalendarGrid>
              <HeatCalendarTooltip />
            </HeatCalendarGrid>
            <HeatCalendarLegend />
          </>
        ) : (
          children
        )}
      </div>
    </HeatCalendarContext.Provider>
  );
}

export { useHeatCalendar } from "./heat-calendar/context";
export { HeatCalendarGrid } from "./heat-calendar/grid";
export { HeatCalendarLegend } from "./heat-calendar/legend";
export { HeatCalendarTooltip } from "./heat-calendar/tooltip";
export type { HeatCalendarCell, HeatCalendarProps, HeatCalendarSelection } from "./heat-calendar/types";
