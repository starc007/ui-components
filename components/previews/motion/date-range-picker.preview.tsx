"use client";

import { useState } from "react";
import { DateRangePickerDropdown } from "@/components/motion/date-range-picker";

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
      monthStart: date(29),
    };
  });
  return (
    <DateRangePickerDropdown
      label="Reporting period"
      defaultMonth={period.today}
      defaultValue={{ from: period.weekStart, to: period.today }}
      max={period.today}
      presets={[
        {
          label: "Last 7 days",
          value: { from: period.weekStart, to: period.today },
        },
        {
          label: "Last 30 days",
          value: { from: period.monthStart, to: period.today },
        },
      ]}
    />
  );
}
