"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { usePriceTargetFan } from "./context";
import {
  PriceTargetFanCursor,
  PriceTargetFanHistory,
  PriceTargetFanNow,
  PriceTargetFanTargets,
} from "./series";
import { PriceTargetFanTooltip } from "./tooltip";
import { fmtAxisDate, H, PAD, W } from "./utils";

/** HTML positioning container. Place Tooltip beside SVG, never inside SVG. */
export function PriceTargetFanPlot({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children === undefined ? (
        <>
          <PriceTargetFanSvg />
          <PriceTargetFanTooltip />
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function PriceTargetFanSvg({ children, className }: { children?: ReactNode; className?: string }) {
  const { svgRef, label, mean, fmt, current, onMove, setActive, fadeId, clipId, reduce, geo, drawn } =
    usePriceTargetFan();
  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG cannot contain a fieldset; group exposes the interactive SVG descendants.
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={cn("block h-auto w-full cursor-crosshair [&_*]:cursor-crosshair", className)}
      role="group"
      aria-label={`${label}: mean ${fmt(mean.price)}, now ${fmt(current)}`}
      onPointerMove={onMove}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setActive(null);
      }}
    >
      <defs>
        {/* both vertical guides fade out toward the top so they read as markers, not walls */}
        <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={0} y1={PAD.t} x2={0} y2={H - PAD.b}>
          <stop offset="0" stopColor="var(--border-strong)" stopOpacity={0} />
          <stop offset="0.45" stopColor="var(--border-strong)" stopOpacity={1} />
          <stop offset="1" stopColor="var(--border-strong)" stopOpacity={1} />
        </linearGradient>
        {/* the fan reveals left to right through this clip, so the dashed projections draw as lines */}
        <clipPath id={clipId}>
          <motion.rect
            x={geo.nowX}
            y={0}
            height={H}
            initial={{ width: reduce ? W - geo.nowX : 0 }}
            animate={{ width: W - geo.nowX }}
            transition={drawn ?? { duration: 0.8, ease: EASE_OUT, delay: 0.85 }}
          />
        </clipPath>
      </defs>

      {children === undefined ? (
        <>
          <PriceTargetFanAxes />
          <PriceTargetFanHistory />
          <PriceTargetFanTargets />
          <PriceTargetFanNow />
          <PriceTargetFanCursor />
        </>
      ) : (
        children
      )}
    </svg>
  );
}

export function PriceTargetFanAxes({ className }: { className?: string }) {
  const { gridVals, y, geo, dates, history, fadeId } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* gridlines and the price axis */}
      {gridVals.out.map((v) => (
        <g key={v}>
          <line x1={PAD.l} y1={y(v)} x2={geo.endX} y2={y(v)} stroke="var(--border)" strokeDasharray="2 5" />
          <text
            x={PAD.l - 8}
            y={y(v) + 3}
            textAnchor="end"
            fontSize={9}
            fill="var(--muted-foreground)"
            className="font-mono tabular-nums"
          >
            {gridVals.step >= 1 ? Math.round(v) : v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* the date axis: history, now, horizon */}
      {[
        ...(history.length
          ? [{ x: geo.hx(0), t: dates.start ?? fmtAxisDate(history[0].date), a: "start" as const }]
          : []),
        ...(history.length > 2
          ? [
              {
                x: geo.hx(Math.floor(history.length / 2)),
                t: dates.mid ?? fmtAxisDate(history[Math.floor(history.length / 2)].date),
                a: "middle" as const,
              },
            ]
          : []),
        { x: geo.nowX, t: "Now", a: "middle" as const },
        { x: geo.endX, t: dates.horizon ?? "Target", a: "middle" as const },
      ].map((d) => (
        <text
          key={d.x}
          x={d.x}
          y={H - 8}
          textAnchor={d.a}
          fontSize={9}
          fill="var(--muted-foreground)"
          className="font-mono"
        >
          {d.t}
        </text>
      ))}

      {/* the now marker */}
      <line
        x1={geo.nowX}
        y1={PAD.t}
        x2={geo.nowX}
        y2={H - PAD.b}
        stroke={`url(#${fadeId})`}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
    </g>
  );
}
