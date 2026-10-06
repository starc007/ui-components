"use client";

import { cn } from "@/lib/utils";
import { useTreemap } from "./context";

export interface TreemapLegendProps {
  className?: string;
  showValues?: boolean;
}

export function TreemapLegend({ className, showValues = false }: TreemapLegendProps) {
  const { nodes, formatValue } = useTreemap();
  if (!nodes.length) return null;
  return (
    <ul
      aria-label="Treemap legend"
      className={cn("flex flex-wrap gap-x-5 gap-y-2 text-xs", className)}
    >
      {nodes.map((node) => (
        <li key={node.id} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: node.color }}
          />
          <span className="text-muted-foreground">{node.label}</span>
          {showValues ? (
            <span className="font-mono tabular-nums">{formatValue(node.value)}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
