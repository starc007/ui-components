"use client";

import { useState } from "react";
import {
  StatusBar,
  StatusBarLegend,
  StatusBarPlot,
  StatusBarTooltip,
  STATUS_BAR_STATUSES,
  type StatusBarDatum,
} from "@/components/charts/status-bar";
import { Button } from "@/components/motion/button";

// Illustrative history lives in the preview. Each period retains its identity
// when the incident simulation updates the last three observations.
const history: readonly StatusBarDatum[] = Array.from({ length: 48 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 7, 21 + i));
  return {
    id: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }),
    status: i === 8 ? "degraded" : "operational",
    description: i === 8 ? "Elevated response times for 12 minutes." : "All checks passed.",
  };
});
const website = history.map((datum) => ({
  ...datum,
  status: "operational",
  description: "All checks passed.",
}));
const statuses = STATUS_BAR_STATUSES.slice(0, 3);

export function StatusBarPreview() {
  const [incident, setIncident] = useState(false);
  const [replay, setReplay] = useState(0);
  const api = history.map((datum, i) =>
    incident && i >= 45
      ? {
          ...datum,
          status: i === 46 ? "outage" : "degraded",
          description: i === 46 ? "Requests failed for 4 minutes." : "Elevated response times.",
        }
      : datum,
  );
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">48 days of status</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" tabIndex={0} onClick={() => setReplay((value) => value + 1)}>
            Replay
          </Button>
          <Button variant="ghost" size="sm" tabIndex={0} onClick={() => setIncident((value) => !value)}>
            {incident ? "Resolve incident" : "Simulate incident"}
          </Button>
        </div>
      </div>
      <StatusBar key={`api-${replay}`} data={api} statuses={statuses} label="API status">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">API</span>
          <span className="text-muted-foreground">{incident ? "Degraded" : "Operational"}</span>
        </div>
        <StatusBarPlot />
        <StatusBarTooltip />
      </StatusBar>
      <StatusBar
        key={`website-${replay}`}
        data={website}
        statuses={statuses}
        label="Website status"
        className="border-t border-border pt-6"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Website</span>
          <span className="text-muted-foreground">Operational</span>
        </div>
        <StatusBarPlot />
        <StatusBarTooltip />
        <StatusBarLegend className="pt-2" />
      </StatusBar>
    </div>
  );
}
