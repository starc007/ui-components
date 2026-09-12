"use client";

import { HeatCalendar } from "@/components/charts/heat-calendar";

export function HeatCalendarPreview() {
  return <HeatCalendar unit="commits" weeks={16} maxCount={14} />;
}
