"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useStatusBar } from "./context";

export interface StatusBarLegendProps extends ComponentProps<"ul"> {
  showCounts?: boolean;
}

export function StatusBarLegend({
  className,
  showCounts = false,
  children,
  ...props
}: StatusBarLegendProps) {
  const { statuses, rows } = useStatusBar();
  return (
    <ul
      aria-label="Status legend"
      {...props}
      data-slot="status-bar-legend"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {children ??
        statuses.map((status) => (
          <li key={status.id} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span>{status.label}</span>
            {showCounts ? (
              <span className="tabular-nums">
                ({rows.filter((row) => row.status.id === status.id).length})
              </span>
            ) : null}
          </li>
        ))}
    </ul>
  );
}
