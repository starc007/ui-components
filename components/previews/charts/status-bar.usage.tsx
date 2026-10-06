"use client";

import {
  StatusBar,
  StatusBarLegend,
  StatusBarPlot,
  StatusBarTooltip,
  type StatusBarDatum,
  type StatusBarStatus,
} from "@/components/charts/status-bar";

/** Pass your service history in chronological order. Replace a period's status
 * with the same ID to crossfade its bar without replaying the entire history. */
export function StatusBarExample({
  data,
  statuses,
}: {
  data: readonly StatusBarDatum[];
  statuses?: readonly StatusBarStatus[];
}) {
  return (
    <StatusBar data={data} statuses={statuses} label="API status">
      <StatusBarPlot />
      <StatusBarTooltip />
      <StatusBarLegend />
    </StatusBar>
  );
}
