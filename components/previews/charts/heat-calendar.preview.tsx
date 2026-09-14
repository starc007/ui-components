"use client";

import {
  HeatCalendar,
  HeatCalendarGrid,
  HeatCalendarLegend,
  HeatCalendarTooltip,
} from "@/components/charts/heat-calendar";

/** Deterministic demo field so every render agrees; weekends run quieter. */
function demoLevel(week: number, day: number) {
  const s = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
  const r = s - Math.floor(s);
  return day >= 5 ? Math.max(0, r - 0.55) * 1.4 : r;
}

const values = Array.from({ length: 16 }, (_, w) => Array.from({ length: 7 }, (_, d) => demoLevel(w, d)));

export function HeatCalendarPreview() {
  return (
    <HeatCalendar unit="commits" weeks={16} maxCount={14} values={values}>
      <HeatCalendarGrid>
        <HeatCalendarTooltip />
      </HeatCalendarGrid>
      <HeatCalendarLegend />
    </HeatCalendar>
  );
}
