"use client";

/* Bars grow out of the baseline with a short stagger the first time the chart
 * scrolls into view. Each bar is a unit rect placed with translate and scale,
 * plus a rounded cap that only translates, so value changes animate
 * transforms alone and the corners never stretch. Categories glide to a new
 * rank when sorting reorders them; a hidden series collapses into the
 * baseline while the axis rescales. Reduced motion: no growth, glide or
 * stagger, values update in place. */

import { motion, type Transition, useInView } from "motion/react";
import { useEffect, useId, useState } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { XYGridLines, XYTickLabels } from "../xy/axis";
import { XYInspector } from "../xy/inspector";
import { labelStride } from "../xy/scale";
import { useElementWidth } from "../xy/use-width";
import { useBarChart } from "./context";

/** Gutter for value labels (vertical bars), in px. */
const VALUE_AXIS = 44;
const PAD = { top: 12, right: 12, bottom: 0 } as const;
/** Fraction of each category slot the bars occupy. */
const FILL = 0.7;
const GAP = 3;
const MAX_BAR = 32;
const MAX_STACK = 56;
const RADIUS = 4;
// Collapsing to an exact zero scale can leave a hairline in some browsers.
const NONE = 0.0001;

export interface BarChartPlotProps {
  /** Plot height in px. Horizontal charts default to 36px per category. */
  height?: number;
  /** Width of the category label gutter for horizontal bars, in px. */
  labelWidth?: number;
  showGrid?: boolean;
  className?: string;
}

export function BarChartPlot({
  height: heightProp,
  labelWidth = 96,
  showGrid = true,
  className,
}: BarChartPlotProps) {
  const {
    rows,
    categories,
    visibleRows,
    hidden,
    highlight,
    order,
    totals,
    domain,
    layout,
    orientation,
    formatValue,
    formatTick,
    label,
    activeIndex,
    setActive,
    open,
    setOpen,
    plotRef,
    tooltipId,
    reduce,
    canHover,
  } = useBarChart();
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setIntro(false), 900);
    return () => clearTimeout(timer);
  }, [inView]);
  const clipId = useId();
  const n = categories.length;
  const vertical = orientation === "vertical";
  const height = heightProp ?? (vertical ? 288 : Math.max(160, n * 36));

  if (!n || !rows.length)
    return (
      <p
        className={cn("flex items-center justify-center text-sm text-muted-foreground", className)}
        style={{ height }}
      >
        No data
      </p>
    );

  // Band axis runs along categories; value axis along magnitudes.
  const bandStart = vertical ? VALUE_AXIS : 0;
  const bandLength = vertical ? Math.max(0, width - VALUE_AXIS - PAD.right) : height;
  const valueStart = vertical ? height - PAD.bottom : labelWidth;
  const valueLength = vertical
    ? height - PAD.top - PAD.bottom
    : Math.max(0, width - labelWidth - PAD.right * 2);
  const slot = bandLength / n;
  const scale = (value: number) => (value / (domain.max || 1)) * valueLength;
  /** Value to px along the value axis, for gridlines and tick labels. */
  const valueAt = (value: number) => (vertical ? valueStart - scale(value) : valueStart + scale(value));

  const k = Math.max(1, visibleRows.length);
  const grouped = layout === "grouped";
  const thickness = grouped
    ? Math.max(1, Math.min(MAX_BAR, (slot * FILL - (k - 1) * GAP) / k))
    : Math.max(1, Math.min(MAX_STACK, slot * FILL));
  const groupThickness = grouped ? k * thickness + (k - 1) * GAP : thickness;
  const radius = Math.min(RADIUS, thickness / 2);
  const revealed = inView || reduce;
  const spring: Transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const activeRank = activeIndex >= 0 ? order.indexOf(activeIndex) : -1;
  const stride = labelStride(n, bandLength, vertical ? 56 : 18);

  return (
    <div className={cn("min-w-0 select-none", className)}>
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 ? (
          <>
            <svg
              aria-hidden="true"
              width={width}
              height={height}
              className="absolute inset-0 overflow-visible"
            >
              <defs>
                <clipPath id={clipId}>
                  {/* Caps of short bars would poke through the baseline. */}
                  {vertical ? (
                    <rect x={0} y={-16} width={width} height={valueStart + 16} />
                  ) : (
                    <rect x={valueStart} y={0} width={width} height={height} />
                  )}
                </clipPath>
              </defs>
              {showGrid ? (
                <XYGridLines
                  ticks={domain.ticks}
                  position={valueAt}
                  axis={vertical ? "y" : "x"}
                  from={vertical ? bandStart : 0}
                  to={vertical ? bandStart + bandLength : height}
                  reduce={reduce}
                />
              ) : null}
              {/* A soft band behind the inspected category, the full depth of
                  the plot, gliding between slots. Bars stay at full strength. */}
              <motion.rect
                x={0}
                y={0}
                width={vertical ? slot : valueLength + PAD.right}
                height={vertical ? valueLength : slot}
                rx={4}
                fill="currentColor"
                className="text-foreground"
                initial={false}
                animate={{
                  x: vertical ? bandStart + Math.max(activeRank, 0) * slot : valueStart,
                  y: vertical ? PAD.top : Math.max(activeRank, 0) * slot,
                  opacity: open && activeRank >= 0 ? 0.05 : 0,
                }}
                transition={{ default: spring, opacity: { duration: 0.1, ease: EASE_OUT } }}
              />
              <g clipPath={`url(#${clipId})`}>
                {order.map((categoryIndex, rank) => {
                  const category = categories[categoryIndex];
                  const delay = intro && !reduce ? Math.min(rank * 0.035, 0.4) : 0;
                  const position = bandStart + rank * slot;
                  let stack = 0;
                  let visibleSlot = 0;
                  const topRow = [...visibleRows].reverse().find((row) => (row.values[categoryIndex] ?? 0) > 0);
                  return (
                    <motion.g
                      key={category}
                      initial={false}
                      animate={{ [vertical ? "x" : "y"]: position }}
                      transition={spring}
                    >
                      {rows.map((row) => {
                        const isHidden = hidden.includes(row.id);
                        const value = isHidden ? 0 : (row.values[categoryIndex] ?? 0);
                        const length = revealed ? scale(value) : 0;
                        const start = grouped || !revealed ? 0 : scale(stack);
                        const offset =
                          (slot - groupThickness) / 2 +
                          (grouped
                            ? (isHidden ? (k - 1) / 2 : visibleSlot) * (thickness + GAP)
                            : 0);
                        if (!isHidden) {
                          stack += value;
                          visibleSlot++;
                        }
                        const capped = grouped || row.id === topRow?.id;
                        const inset = capped ? radius : 0;
                        const bodyLength = Math.max(NONE, length - inset);
                        const end = start + length;
                        const transition: Transition = {
                          default: { ...spring, delay },
                          opacity: { duration: 0.15, ease: EASE_OUT },
                        };
                        const shown = value > 0 && !isHidden;
                        const opacity = highlight !== null && highlight !== row.id ? 0.25 : 1;
                        return (
                          <g key={row.id} fill={row.color}>
                            <motion.rect
                              x={0}
                              y={0}
                              width={vertical ? thickness : 1}
                              height={vertical ? 1 : thickness}
                              style={{ originX: 0, originY: 0 }}
                              initial={false}
                              animate={
                                vertical
                                  ? {
                                      x: offset,
                                      y: valueStart - end + inset,
                                      scaleY: bodyLength,
                                      opacity: shown ? opacity : 0,
                                    }
                                  : {
                                      y: offset,
                                      x: valueStart + start,
                                      scaleX: bodyLength,
                                      opacity: shown ? opacity : 0,
                                    }
                              }
                              transition={transition}
                            />
                            {capped ? (
                              <motion.rect
                                x={0}
                                y={0}
                                width={vertical ? thickness : radius * 2}
                                height={vertical ? radius * 2 : thickness}
                                rx={radius}
                                initial={false}
                                animate={
                                  vertical
                                    ? { x: offset, y: valueStart - end, opacity: shown ? opacity : 0 }
                                    : {
                                        y: offset,
                                        x: valueStart + end - radius * 2,
                                        opacity: shown ? opacity : 0,
                                      }
                                }
                                transition={transition}
                              />
                            ) : null}
                          </g>
                        );
                      })}
                    </motion.g>
                  );
                })}
              </g>
            </svg>
            {vertical ? (
              <XYTickLabels
                ticks={domain.ticks}
                position={valueAt}
                axis="y"
                format={formatTick}
                reduce={reduce}
                offset={VALUE_AXIS}
              />
            ) : (
              order.map((categoryIndex, rank) => (
                <motion.span
                  key={categories[categoryIndex]}
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-0 left-0 truncate pr-3 text-right text-xs text-muted-foreground",
                    rank % stride !== 0 && "invisible",
                  )}
                  style={{ width: labelWidth, lineHeight: `${slot}px` }}
                  initial={false}
                  animate={{ y: rank * slot }}
                  transition={spring}
                >
                  {categories[categoryIndex]}
                </motion.span>
              ))
            )}
          </>
        ) : null}
        <div
          ref={plotRef}
          className="absolute rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring"
          style={
            vertical
              ? { left: bandStart, width: bandLength, top: PAD.top, bottom: PAD.bottom }
              : { left: valueStart, width: valueLength, top: 0, height: bandLength }
          }
        >
          <XYInspector
            count={n}
            activeIndex={activeRank}
            onActive={(rank) => setActive(categories[order[rank]])}
            label={`${label}: inspect categories`}
            valueText={(rank) => {
              const i = order[rank];
              return [
                categories[i],
                ...visibleRows.map((row) => {
                  const value = row.values[i];
                  return `${row.name} ${value === null ? "no data" : formatValue(value)}`;
                }),
                ...(layout === "stacked" && visibleRows.length > 1
                  ? [`Total ${formatValue(totals[i])}`]
                  : []),
              ].join(". ");
            }}
            mode="band"
            orientation={vertical ? "horizontal" : "vertical"}
            open={open}
            setOpen={setOpen}
            tooltipId={tooltipId}
            canHover={canHover}
            className="inset-0 size-full"
          />
        </div>
      </div>
      <div aria-hidden="true" className="relative mt-2 h-4">
        {width > 0
          ? vertical
            ? order.map((categoryIndex, rank) => (
                <motion.span
                  key={categories[categoryIndex]}
                  className={cn(
                    "absolute top-0 left-0 truncate px-0.5 text-center text-[11px] text-muted-foreground",
                    rank % stride !== 0 && "invisible",
                  )}
                  // Shown labels borrow the slots of the hidden ones around them.
                  style={{ width: slot * stride }}
                  initial={false}
                  animate={{ x: bandStart + (rank + 0.5) * slot - (slot * stride) / 2 }}
                  transition={spring}
                >
                  {categories[categoryIndex]}
                </motion.span>
              ))
            : (
              <XYTickLabels
                ticks={domain.ticks}
                position={valueAt}
                axis="x"
                format={formatTick}
                reduce={reduce}
                offset={0}
              />
            )
          : null}
      </div>
    </div>
  );
}
