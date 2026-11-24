"use client";

import { cn } from "@/lib/utils";
import { DateRangePickerCalendar } from "./calendar";
import { DateRangePickerContent } from "./content";
import { DateRangePicker } from "./root";
import { DateRangePickerTrigger } from "./trigger";
import type { DateRangePickerProps } from "./types";

export interface DateRangePickerDropdownProps
  extends Omit<DateRangePickerProps, "children"> {
  placeholder?: string;
  triggerClassName?: string;
  calendarClassName?: string;
}
/** Convenience composition of the root, trigger, content and calendar. */
export function DateRangePickerDropdown({
  placeholder,
  triggerClassName,
  calendarClassName,
  autoFocus = true,
  showSummary = false,
  ...props
}: DateRangePickerDropdownProps) {
  return (
    <DateRangePicker {...props} autoFocus={autoFocus} showSummary={showSummary}>
      <DateRangePickerTrigger
        placeholder={placeholder}
        className={triggerClassName}
      />
      <DateRangePickerContent autoFocus={autoFocus}>
        <DateRangePickerCalendar
          className={cn("w-full rounded-none border-0", calendarClassName)}
        />
      </DateRangePickerContent>
    </DateRangePicker>
  );
}
