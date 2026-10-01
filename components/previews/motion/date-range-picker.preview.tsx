"use client";

import { useState } from "react";
import {
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerClear,
  DateRangePickerContent,
  DateRangePickerFooter,
  DateRangePickerGrid,
  DateRangePickerHeader,
  DateRangePickerSelection,
  DateRangePickerTrigger,
} from "@/components/motion/date-range-picker";

export function DateRangePickerPreview() {
  const [period] = useState(() => {
    const now = new Date();
    const date = (daysAgo: number) => {
      const day = new Date(now);
      day.setDate(day.getDate() - daysAgo);
      return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    };
    return {
      today: date(0),
      weekStart: date(6),
    };
  });
  return (
    <DateRangePicker
      label="Reporting period"
      defaultMonth={period.today}
      defaultValue={{ from: period.weekStart, to: period.today }}
      max={period.today}
    >
      <DateRangePickerTrigger />
      <DateRangePickerContent>
        <DateRangePickerCalendar className="w-full rounded-none border-0">
          <DateRangePickerHeader />
          <DateRangePickerGrid />
          <DateRangePickerFooter>
            <div className="flex items-center justify-between gap-2">
              <DateRangePickerSelection />
              <DateRangePickerClear />
            </div>
          </DateRangePickerFooter>
        </DateRangePickerCalendar>
      </DateRangePickerContent>
    </DateRangePicker>
  );
}
