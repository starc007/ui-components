"use client";

import { motion, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useBumpChart } from "./context";
import { PLOT } from "./model";
import type { BumpPosition } from "./use-geometry";

export function BumpChartPoint({
  seriesId,
  period,
  seriesIndex,
  position,
}: {
  seriesId: string;
  period: string;
  seriesIndex: number;
  position: BumpPosition | undefined;
}) {
  const { rows, periods, highlighted, pinned, select, setHovered, setFocused, canHover, reduce } =
    useBumpChart();
  const row = rows.find((item) => item.id === seriesId);
  const index = periods.indexOf(period);
  const rank = row?.ranks[index];
  if (!row || rank == null || !position) return null;
  const previous = row.ranks[index - 1];
  const change = previous == null ? null : previous - rank;
  const active = highlighted === row.id;
  const dimmed = highlighted !== null && !active;
  const changeLabel =
    change == null
      ? "No previous rank"
      : change === 0
        ? "No change"
        : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} ${Math.abs(change) === 1 ? "place" : "places"}`;

  return (
    <MovingPoint position={position}>
      <div
        className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
        onPointerEnter={() => {
          if (canHover) setHovered(row.id);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        <Tooltip
          delay={60}
          className="min-w-[156px]"
          content={
            <>
              <span className="flex items-center justify-between gap-4 text-[10px] text-muted-foreground">
                <span>{row.name}</span>
                <span>{period}</span>
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-4">
                <span className="font-mono text-lg font-medium" style={{ color: row.color }}>
                  #{rank}
                </span>
                <span className="text-xs">{changeLabel}</span>
              </span>
              {previous != null && (
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Previously #{previous} in {periods[index - 1]}
                </span>
              )}
            </>
          }
        >
          <motion.button
            type="button"
            aria-label={`${row.name}, ${period}: rank ${rank}`}
            aria-pressed={pinned === row.id}
            onFocus={() => setFocused(row.id)}
            onBlur={() => setFocused(null)}
            onClick={() => select(pinned === row.id ? null : row.id)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                select(null);
                setFocused(null);
                setHovered(null);
              }
            }}
            initial={reduce ? false : { transform: "scale(0.85)", opacity: 0 }}
            animate={{ transform: "scale(1)", opacity: dimmed ? 0.22 : 1 }}
            transition={{ transform: SPRING_PRESS, opacity: { duration: 0.18, ease: EASE_OUT } }}
            whileHover={canHover && !reduce ? { transform: "scale(1.12)" } : undefined}
            className="relative flex size-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            style={{ color: row.color }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-current"
              initial={false}
              animate={{ opacity: active ? 0.12 : 0 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            />
            <motion.span
              className="relative flex size-5 items-center justify-center rounded-full border-[1.5px] border-current bg-background font-mono text-[9px] font-medium"
              initial={reduce ? false : { transform: "scale(0.85)" }}
              animate={{ transform: "scale(1)" }}
              transition={{
                ...SPRING_PRESS,
                delay: reduce ? 0 : Math.min(index, 8) * 0.025 + Math.min(seriesIndex, 4) * 0.015,
              }}
            >
              {rank}
            </motion.span>
          </motion.button>
        </Tooltip>
      </div>
    </MovingPoint>
  );
}

function MovingPoint({ position, children }: { position: BumpPosition; children: ReactNode }) {
  const { height } = useBumpChart();
  const transform = useTransform(
    [position.x, position.y],
    ([x, y]: number[]) => `translate(${(x / PLOT.width) * 100}%, ${(y / height) * 100}%)`,
  );
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ transform }}>
      {children}
    </motion.div>
  );
}
