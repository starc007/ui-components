"use client";

import { MorphPopover } from "@/components/motion/popover-morph";
import { cn } from "@/lib/utils";
import { DateRangePickerCalendar } from "./calendar";
import { DateRangePickerContext } from "./context";
import type { DateRangePickerProps } from "./types";
import { useDateRangePickerController } from "./use-date-range-picker";

/** Range state and popover root. Without children, renders the inline calendar. */
export function DateRangePicker({
  children,
  className,
  ...props
}: DateRangePickerProps) {
  const ctx = useDateRangePickerController(props);
  return (
    <DateRangePickerContext.Provider value={ctx}>
      <MorphPopover
        open={ctx.open}
        onOpenChange={ctx.setOpen}
        className={cn("max-w-full", children !== undefined && className)}
      >
        {children === undefined ? (
          <DateRangePickerCalendar className={className} />
        ) : (
          children
        )}
        {ctx.single && (
          <span role="status" className="sr-only">
            {ctx.announcement}
          </span>
        )}
      </MorphPopover>
    </DateRangePickerContext.Provider>
  );
}
