"use client";

import { cn } from "@/lib/utils";
import { ReturnsCalendarContext, useReturnsCalendarModel } from "./returns-calendar/context";
import { ReturnsCalendarGrid } from "./returns-calendar/grid";
import { ReturnsCalendarTooltip } from "./returns-calendar/tooltip";
import type { ReturnsCalendarProps } from "./returns-calendar/types";

/** Compose Grid and Tooltip, or omit children for the complete chart. */
export function ReturnsCalendar({ children, className, ...props }: ReturnsCalendarProps) {
  const model = useReturnsCalendarModel(props);
  return (
    <ReturnsCalendarContext.Provider value={model}>
      <div className={cn("w-[480px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
        {children === undefined ? (
          <ReturnsCalendarGrid>
            <ReturnsCalendarTooltip />
          </ReturnsCalendarGrid>
        ) : (
          children
        )}
      </div>
    </ReturnsCalendarContext.Provider>
  );
}

export { useReturnsCalendar } from "./returns-calendar/context";
export { ReturnsCalendarGrid } from "./returns-calendar/grid";
export { ReturnsCalendarTooltip } from "./returns-calendar/tooltip";
export type {
  ReturnsCalendarProps,
  ReturnsCalendarSelection,
  ReturnsCalendarTooltipData,
} from "./returns-calendar/types";

// A local type alias keeps docgen from listing this data shape as a component.
export type ReturnsCalendarCell = import("./returns-calendar/types").ReturnsCalendarCell;
