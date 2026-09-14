"use client";

import {
  ReturnsCalendar,
  ReturnsCalendarGrid,
  ReturnsCalendarTooltip,
} from "@/components/charts/returns-calendar";

const MONTHS = Array.from({ length: 12 });
const DEFAULT_YEARS = [2021, 2022, 2023, 2024, 2025];

/** Deterministic sample field so every render agrees; 2022 reads as a down year. */
const DEFAULT_RETURNS: number[][] = (() => {
  let seed = 2021;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return DEFAULT_YEARS.map((_, yi) =>
    MONTHS.map(() => Math.round(((yi === 1 ? -1.6 : 0.9) + (rnd() - 0.5) * 12) * 10) / 10),
  );
})();

export function ReturnsCalendarPreview() {
  return (
    <ReturnsCalendar years={DEFAULT_YEARS} returns={DEFAULT_RETURNS}>
      <ReturnsCalendarGrid>
        <ReturnsCalendarTooltip />
      </ReturnsCalendarGrid>
    </ReturnsCalendar>
  );
}
