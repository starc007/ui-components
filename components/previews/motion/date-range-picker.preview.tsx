"use client";

import { DateRangePicker } from "@/components/motion/date-range-picker";

export function DateRangePickerPreview() {
  return (
    <DateRangePicker
      label="Reporting period"
      defaultMonth="2026-10-01"
      defaultValue={{ from: "2026-10-05", to: "2026-10-12" }}
      min="2026-01-01"
      max="2027-12-31"
      isDateDisabled={(date) => date === "2026-10-20"}
      presets={[
        {
          label: "First week",
          value: { from: "2026-10-01", to: "2026-10-07" },
        },
        { label: "Two weeks", value: { from: "2026-10-01", to: "2026-10-14" } },
      ]}
    />
  );
}
