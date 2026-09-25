"use client";

import { useId, useRef, useState } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { CompositionTooltipContent } from "./tooltip-content";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_LAYOUT } from "@/lib/ease";
import { useCompositionChart } from "./context";
import { compositionArea } from "./model";

export function CompositionChartPlot({ className }: { className?: string }) {
  const { columns, rows, column, index, select, view, highlight, reduce, canHover } =
    useCompositionChart();
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  if (!columns.length || !rows.length)
    return (
      <p
        className={cn(
          "flex min-h-64 items-center justify-center text-sm text-muted-foreground",
          className,
        )}
      >
        No composition data
      </p>
    );
  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>
          {column?.id}
          {column?.valid ? "" : " · No data"}
        </span>
        <span className="font-mono">100%</span>
      </div>
      <div
        ref={anchorRef}
        onPointerLeave={() => setTooltipOpen(false)}
        className="relative h-64 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring sm:h-80"
        onPointerMove={(event) => {
          if (!canHover || event.pointerType === "touch") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const next = Math.min(
            columns.length - 1,
            Math.max(
              0,
              Math.floor(((event.clientX - bounds.left) / bounds.width) * columns.length),
            ),
          );
          select(columns[next].id);
          setTooltipOpen(true);
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="size-full overflow-visible"
        >
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className="text-border"
            />
          ))}
          {view === "area"
            ? rows.map((row, r) => (
                <motion.path
                  key={row.id}
                  d={compositionArea(columns, r)}
                  fill={row.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: highlight && highlight !== row.id ? 0.18 : 0.9 }}
                  transition={{ duration: 0.18 }}
                />
              ))
            : columns.map(
                (col, i) =>
                  col.valid &&
                  col.segments.map((segment) => (
                    <motion.rect
                      key={`${col.id}/${segment.id}`}
                      x={(i / columns.length) * 100 + 10 / columns.length}
                      y="0"
                      width={80 / columns.length}
                      height="1"
                      fill={segment.color}
                      initial={false}
                      animate={{
                        y: 100 - segment.offset - segment.share,
                        scaleY: segment.share,
                        opacity: highlight && highlight !== segment.id ? 0.18 : 0.9,
                      }}
                      style={{ originY: "0px", originX: "0px" }}
                      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                    />
                  )),
              )}
          <motion.line
            initial={false}
            animate={{ x: ((index + 0.5) / columns.length) * 100 }}
            transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
            x1="0"
            x2="0"
            y1="0"
            y2="100"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 3"
            className="text-foreground/70"
          />
        </svg>
        <input
          type="range"
          aria-label="Inspect period"
          min={0}
          max={columns.length - 1}
          step={1}
          value={index}
          aria-valuetext={column?.id}
          aria-describedby={tooltipOpen ? tooltipId : undefined}
          onFocus={() => setTooltipOpen(true)}
          onBlur={() => setTooltipOpen(false)}
          onPointerDown={() => setTooltipOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setTooltipOpen(false);
          }}
          onChange={(event) => {
            select(columns[Number(event.target.value)].id);
            setTooltipOpen(true);
          }}
          className="absolute inset-0 h-full w-full cursor-crosshair opacity-0"
        />
      </div>
      <Tooltip
        id={tooltipId}
        anchorRef={anchorRef}
        anchorPoint={{ x: (index + 0.5) / columns.length, y: 0.3 }}
        side="top"
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
        className="max-w-[calc(100vw-1rem)]"
        content={<CompositionTooltipContent />}
      />
      <div className="flex justify-between gap-4 text-[11px] text-muted-foreground">
        <span>{columns[0].id}</span>
        <span>{columns.at(-1)?.id}</span>
      </div>
    </div>
  );
}
