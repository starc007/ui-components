"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { type SankeyActive, useSankeyChart } from "./context";

// Flows listed per direction in a node's tooltip.
const MAX_FLOWS = 4;

export interface SankeyChartTooltipProps {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** Custom content for the highlighted node or flow. */
  children?: ReactNode | ((active: SankeyActive) => ReactNode);
}

function Ticker({ value, format }: { value: number; format: (value: number) => string }) {
  return (
    <NumberTicker
      value={value}
      format={() => format(value)}
      startOnView={false}
      duration={0.2}
      stagger={0}
    />
  );
}

export function SankeyChartTooltip({ className, side = "top", children }: SankeyChartTooltipProps) {
  const {
    active,
    nodes,
    links,
    size,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    formatValue,
  } = useSankeyChart();
  if (!nodes.length) return null;
  // Anchors keyboard focus to the top of the node, so the tooltip clears its
  // label, or to the flow's midpoint; the pointer takes over while it moves.
  const point =
    active?.type === "node"
      ? { x: (active.node.x0 + active.node.x1) / 2, y: active.node.y0 }
      : active?.type === "link"
        ? { x: (active.link.x0 + active.link.x1) / 2, y: (active.link.y0 + active.link.y1) / 2 }
        : { x: size.width / 2, y: size.height / 2 };
  const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
  return (
    <Tooltip
      id={tooltipId}
      anchorRef={plotRef}
      followCursor
      anchorPoint={{ x: point.x / size.width, y: point.y / size.height }}
      open={tooltipOpen && active !== null}
      onOpenChange={setTooltipOpen}
      side={side}
      className={cn("max-w-64", className)}
      content={
        active ? (
          typeof children === "function" ? (
            children(active)
          ) : (
            (children ?? (
              <MotionConfig transition={{ type: "tween" }}>
                {active.type === "node" ? (
                  <span className="flex flex-col gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: active.node.color }}
                      />
                      {active.node.label}
                    </span>
                    <span className="font-mono tabular-nums">
                      <Ticker value={active.node.value} format={formatValue} />
                    </span>
                    {active.node.inValue && active.node.outValue ? (
                      <span className="font-mono text-muted-foreground tabular-nums">
                        In {formatValue(active.node.inValue)} · Out{" "}
                        {formatValue(active.node.outValue)}
                      </span>
                    ) : null}
                    {(["in", "out"] as const).map((direction) => {
                      // A node's largest flows that way; the table has the rest.
                      const own = links
                        .filter((l) =>
                          direction === "in" ? l.target === active.node : l.source === active.node,
                        )
                        .sort((a, b) => b.value - a.value);
                      if (!own.length) return null;
                      return (
                        <span key={direction} className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground">
                            {direction === "in" ? "From" : "To"}
                          </span>
                          {own.slice(0, MAX_FLOWS).map((l) => (
                            <span key={l.id} className="flex items-center justify-between gap-3">
                              <span className="truncate">
                                {direction === "in" ? l.source.label : l.target.label}
                              </span>
                              <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                                {formatValue(l.value)}
                              </span>
                            </span>
                          ))}
                          {own.length > MAX_FLOWS ? (
                            <span className="text-muted-foreground">
                              {own.length - MAX_FLOWS} more
                            </span>
                          ) : null}
                        </span>
                      );
                    })}
                    {active.node.description ? (
                      <span className="text-muted-foreground">{active.node.description}</span>
                    ) : null}
                  </span>
                ) : (
                  <span className="flex flex-col gap-1.5 text-xs">
                    <span className="font-medium">
                      {active.link.source.label} → {active.link.target.label}
                    </span>
                    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                      <Ticker value={active.link.value} format={formatValue} />
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        <Ticker value={active.link.share} format={percent} /> of{" "}
                        {active.link.source.label}
                      </span>
                    </span>
                  </span>
                )}
              </MotionConfig>
            ))
          )
        ) : null
      }
    />
  );
}
