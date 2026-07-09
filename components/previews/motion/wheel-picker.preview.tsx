"use client";

import { useEffect, useState } from "react";
import { WheelPicker } from "@/components/motion/wheel-picker";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = Array.from({ length: 60 }, (_, i) => String(1980 + i));

function daysIn(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function WheelPickerPreview() {
  const [month, setMonth] = useState("June");
  const [year, setYear] = useState("2004");
  const [day, setDay] = useState("9");

  const monthIndex = MONTHS.indexOf(month);
  const dayCount = daysIn(monthIndex, Number(year));
  const days = Array.from({ length: dayCount }, (_, i) => String(i + 1));

  // A short month or a non-leap February can strand the day past the end —
  // pull it back to the last valid day.
  useEffect(() => {
    if (Number(day) > dayCount) setDay(String(dayCount));
  }, [day, dayCount]);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm text-muted-foreground">
        Born{" "}
        <span className="font-medium text-foreground tabular-nums">
          {month} {day}, {year}
        </span>
      </span>
      <div className="flex items-stretch gap-1 rounded-3xl border border-border bg-background p-2">
        <WheelPicker
          options={MONTHS}
          value={month}
          onValueChange={setMonth}
          className="w-32 border-0 bg-transparent"
          itemHeight={42}
          aria-label="Month"
        />
        <WheelPicker
          options={days}
          value={day}
          onValueChange={setDay}
          className="w-14 border-0 bg-transparent"
          itemHeight={42}
          aria-label="Day"
        />
        <WheelPicker
          options={YEARS}
          value={year}
          onValueChange={setYear}
          className="w-20 border-0 bg-transparent"
          itemHeight={42}
          aria-label="Year"
        />
      </div>
    </div>
  );
}
