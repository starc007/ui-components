"use client";

/* Lines draw in left to right through a clip the first time the chart scrolls
 * into view, and fade out at both ends of the plot. Every sample is a pair of
 * springs keyed by series and category, so new data, a hidden series or a
 * rescaled axis morph the lines, fills and dots together; a resize snaps.
 *
 * Inspecting glides a crosshair that fades toward its ends, haloed dots, and a
 * pill on the category axis that rolls to the new label while the labels it
 * would cover step aside. Everything right of the crosshair recedes, so the
 * line reads "up to here".
 *
 * While loading, a placeholder line breathes under a travelling highlight.
 * When data arrives it fades away and the real lines draw in.
 *
 * Reduced motion: no draw-in, springs, roll or travelling highlight; values
 * update in place and the placeholder only pulses its opacity. */

import {
  AnimatePresence,
  type MotionValue,
  motion,
  type Transition,
  useInView,
  useTransform,
} from "motion/react";
import { useId, useLayoutEffect, useState } from "react";
import { TextShimmer } from "@/components/motion/text-shimmer";
import { EASE_IN_OUT, EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { XYGridLines, XYTickLabels } from "../xy/axis";
import { XYInspector } from "../xy/inspector";
import type { XYRow } from "../xy/model";
import { areaPath, linePath, type XYCurve } from "../xy/path";
import { labelStride } from "../xy/scale";
import { useAnimatedPoints, type XYAnimatedPoint, type XYPointTarget } from "../xy/use-points";
import { useElementWidth } from "../xy/use-width";
import { useLineChart } from "./context";

/** Left gutter for value labels, in px. */
const AXIS = 44;
const PAD = { top: 12, right: 16, bottom: 8 } as const;
const BASELINE = "baseline";
/** Category labels closer than this to the inspected one hide behind its pill, in px. */
const PILL_CLEAR = 40;
/** How much the line right of the crosshair recedes (mask darkness, 0 to 1). */
const RECEDE = 0.6;
const PLACEHOLDER_SAMPLES = 16;
const pointKey = (series: string, category: string) => JSON.stringify([series, category]);

export interface LineChartPlotProps {
  /** Plot height in px, excluding the category labels. */
  height?: number;
  /** Stroke width of each line, in px. */
  strokeWidth?: number;
  showGrid?: boolean;
  /** Fade lines and fills out toward the left and right edges of the plot. */
  fadeEdges?: boolean;
  className?: string;
}

export function LineChartPlot({
  height = 288,
  strokeWidth = 2,
  showGrid = true,
  fadeEdges = true,
  className,
}: LineChartPlotProps) {
  const {
    rows,
    categories,
    visibleRows,
    hidden,
    highlight,
    domain,
    variant,
    curve,
    formatValue,
    formatTick,
    label,
    loading,
    loadingLabel,
    activeIndex,
    setActive,
    open,
    setOpen,
    touching,
    setTouching,
    setOverlay,
    setGeometry,
    tooltipId,
    reduce,
    canHover,
  } = useLineChart();
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const id = useId();
  const ids = {
    clip: `${id}-clip`,
    mask: `${id}-mask`,
    edges: `${id}-edges`,
    crosshair: `${id}-crosshair`,
    pulse: `${id}-pulse`,
    band: `${id}-band`,
  };
  const n = categories.length;
  const plotWidth = Math.max(0, width - AXIS - PAD.right);
  const innerHeight = height - PAD.top - PAD.bottom;
  const x = (i: number) => AXIS + (n === 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth);
  const y = (value: number) =>
    PAD.top + ((domain.max - value) / (domain.max - domain.min || 1)) * innerHeight;
  const baseline = y(Math.min(domain.max, Math.max(domain.min, 0)));

  useLayoutEffect(() => {
    setGeometry((previous) =>
      previous.width === plotWidth && previous.height === innerHeight
        ? previous
        : { width: plotWidth, height: innerHeight },
    );
  }, [plotWidth, innerHeight, setGeometry]);

  const targets: XYPointTarget[] = [];
  if (width > 0) {
    targets.push({ key: BASELINE, x: 0, y: baseline });
    for (const row of rows)
      row.values.forEach((value, i) => {
        if (value !== null)
          targets.push({ key: pointKey(row.id, categories[i]), x: x(i), y: y(value) });
      });
  }
  const points = useAnimatedPoints(targets, reduce, width);

  const active = activeIndex >= 0 && !loading ? activeIndex : null;
  const inspecting = open && active !== null;
  // Roll the pill's label up when moving right and down when moving left.
  const [lastActive, setLastActive] = useState(active);
  const [direction, setDirection] = useState(1);
  if (active !== lastActive) {
    if (active !== null && lastActive !== null) setDirection(active < lastActive ? -1 : 1);
    setLastActive(active);
  }

  if ((!n || !rows.length) && !loading)
    return (
      <p
        className={cn("flex items-center justify-center text-sm text-muted-foreground", className)}
        style={{ height }}
      >
        No data
      </p>
    );

  const activeValues =
    active === null
      ? []
      : visibleRows.flatMap((row) => {
          const value = row.values[active];
          return value === null ? [] : [{ row, value }];
        });
  const stride = labelStride(n, plotWidth, 64);
  const baselinePoint = points.get(BASELINE);
  // Inspection marks glide between samples for a mouse or keys, but under a
  // finger any glide reads as lag, so they track the touch directly.
  const spring: Transition = reduce || touching ? { duration: 0 } : SPRING_LAYOUT;
  const revealed = (inView || reduce) && !loading;
  const fade = plotWidth > 0 ? Math.min(32, plotWidth * 0.08) / plotWidth : 0;
  const crossX = active === null ? AXIS : x(active);

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
                <clipPath id={ids.clip}>
                  <motion.rect
                    x={0}
                    y={-16}
                    width={width}
                    height={height + 32}
                    style={{ originX: 0 }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: revealed || reduce ? 1 : 0 }}
                    // Wait for the placeholder to leave before drawing in, and
                    // collapse only after the lines have faded on the way back.
                    transition={
                      revealed
                        ? { duration: 0.7, ease: EASE_OUT, delay: 0.12 }
                        : { duration: 0, delay: 0.16 }
                    }
                  />
                </clipPath>
                <linearGradient
                  id={ids.edges}
                  gradientUnits="userSpaceOnUse"
                  x1={AXIS}
                  x2={AXIS + plotWidth}
                  y1={0}
                  y2={0}
                >
                  <stop offset={0} stopColor="white" stopOpacity={fadeEdges ? 0 : 1} />
                  <stop offset={fade} stopColor="white" />
                  <stop offset={1 - fade} stopColor="white" />
                  <stop offset={1} stopColor="white" stopOpacity={fadeEdges ? 0 : 1} />
                </linearGradient>
                <mask
                  id={ids.mask}
                  maskUnits="userSpaceOnUse"
                  x={0}
                  y={-16}
                  width={width}
                  height={height + 32}
                >
                  <rect x={0} y={-16} width={width} height={height + 32} fill={`url(#${ids.edges})`} />
                  <motion.rect
                    x={0}
                    y={-16}
                    width={width}
                    height={height + 32}
                    fill="black"
                    initial={{ x: crossX, opacity: 0 }}
                    animate={{ x: crossX, opacity: inspecting ? RECEDE : 0 }}
                    transition={{ x: spring, opacity: { duration: 0.18, ease: EASE_OUT } }}
                  />
                </mask>
                <linearGradient
                  id={ids.crosshair}
                  gradientUnits="userSpaceOnUse"
                  x1={0}
                  x2={0}
                  y1={PAD.top}
                  y2={height - PAD.bottom}
                >
                  <stop offset={0} stopColor="var(--foreground)" stopOpacity={0} />
                  <stop offset={0.25} stopColor="var(--foreground)" stopOpacity={0.35} />
                  <stop offset={0.75} stopColor="var(--foreground)" stopOpacity={0.35} />
                  <stop offset={1} stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              {showGrid ? (
                <XYGridLines
                  ticks={domain.ticks}
                  position={y}
                  axis="y"
                  from={AXIS}
                  to={AXIS + plotWidth}
                  reduce={reduce}
                />
              ) : null}
              {baselinePoint ? (
                <g mask={`url(#${ids.mask})`}>
                  <motion.g
                    clipPath={`url(#${ids.clip})`}
                    initial={false}
                    animate={{ opacity: loading ? 0 : 1 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                  >
                    {rows.map((row) => (
                      <Series
                        key={row.id}
                        row={row}
                        points={row.values.map((value, i) =>
                          value === null
                            ? null
                            : (points.get(pointKey(row.id, categories[i])) ?? null),
                        )}
                        baseline={baselinePoint.y}
                        curve={curve}
                        area={variant === "area"}
                        // Overlapping fills compound; keep several series from muddying into one slab.
                        fillOpacity={rows.length > 1 ? 0.14 : 0.28}
                        strokeWidth={strokeWidth}
                        hidden={hidden.includes(row.id)}
                        dimmed={highlight !== null && highlight !== row.id}
                      />
                    ))}
                  </motion.g>
                </g>
              ) : null}
              <AnimatePresence>
                {loading ? (
                  <Placeholder
                    key="placeholder"
                    ids={ids}
                    left={AXIS}
                    width={plotWidth}
                    top={PAD.top}
                    height={innerHeight}
                    strokeWidth={strokeWidth}
                    reduce={reduce}
                  />
                ) : null}
              </AnimatePresence>
              {inspecting && active !== null ? (
                <>
                  <motion.line
                    y1={PAD.top}
                    y2={height - PAD.bottom}
                    x1={0}
                    x2={0}
                    stroke={`url(#${ids.crosshair})`}
                    initial={{ x: x(active), opacity: 0 }}
                    animate={{ x: x(active), opacity: 1 }}
                    transition={{ x: spring, opacity: { duration: 0.12 } }}
                  />
                  {activeValues.map(({ row, value }) => (
                    <motion.g
                      key={row.id}
                      initial={{ x: x(active), y: y(value), opacity: 0, scale: 0.5 }}
                      animate={{ x: x(active), y: y(value), opacity: 1, scale: 1 }}
                      transition={{ default: spring, opacity: { duration: 0.12 } }}
                    >
                      <circle r={10} fill={row.color} opacity={0.18} />
                      <circle r={4} fill={row.color} stroke="var(--background)" strokeWidth={2} />
                    </motion.g>
                  ))}
                </>
              ) : null}
            </svg>
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={false}
              animate={{ opacity: loading ? 0 : 1 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            >
              <XYTickLabels
                ticks={domain.ticks}
                position={y}
                axis="y"
                format={formatTick}
                reduce={reduce}
                offset={AXIS}
              />
            </motion.div>
          </>
        ) : null}
        <AnimatePresence>
          {loading ? (
            <motion.output
              key="loading"
              className="pointer-events-none absolute flex items-center justify-center text-xs text-muted-foreground"
              style={{ left: AXIS, right: PAD.right, top: PAD.top, bottom: PAD.bottom }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: reduce ? 0 : 8,
                transition: { duration: 0.18, ease: EASE_OUT },
              }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              {loadingLabel ? (
                <TextShimmer>{loadingLabel}</TextShimmer>
              ) : (
                <span className="sr-only">Loading</span>
              )}
            </motion.output>
          ) : null}
        </AnimatePresence>
        <div
          ref={setOverlay}
          className="absolute rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring"
          style={{ left: AXIS, right: PAD.right, top: PAD.top, bottom: PAD.bottom }}
        >
          {loading ? null : (
            <XYInspector
              count={n}
              activeIndex={activeIndex}
              onActive={(i) => setActive(categories[i])}
              label={`${label}: inspect values`}
              valueText={(i) =>
                [
                  categories[i],
                  ...visibleRows.map((row) => {
                    const value = row.values[i];
                    return `${row.name} ${value === null ? "no data" : formatValue(value)}`;
                  }),
                ].join(". ")
              }
              mode="point"
              open={open}
              setOpen={setOpen}
              onTouchChange={setTouching}
              tooltipId={tooltipId}
              canHover={canHover}
              className="inset-0 size-full"
            />
          )}
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        className="relative mt-2 h-5"
        initial={false}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
      >
        {width > 0
          ? categories.map((category, i) =>
              (n - 1 - i) % stride === 0 ? (
                <span
                  key={category}
                  className="absolute top-0.5 -translate-x-1/2 text-[11px] whitespace-nowrap text-muted-foreground transition-opacity duration-150"
                  style={{
                    left: x(i),
                    opacity: inspecting && Math.abs(x(i) - crossX) < PILL_CLEAR ? 0 : 1,
                  }}
                >
                  {category}
                </span>
              ) : null,
            )
          : null}
        <AnimatePresence>
          {inspecting && active !== null ? (
            <motion.div
              key="pill"
              className="pointer-events-none absolute top-0 left-0"
              initial={{ x: x(active), opacity: 0 }}
              animate={{ x: x(active), opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } }}
              transition={{ x: spring, opacity: { duration: 0.12 } }}
            >
              <span className="block -translate-x-1/2 overflow-hidden rounded-full bg-foreground px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap text-background">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={categories[active]}
                    className="block"
                    initial={{ y: reduce ? 0 : direction * 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reduce ? 0 : direction * -10, opacity: 0 }}
                    transition={reduce ? { duration: 0.12 } : SPRING_SWAP}
                  >
                    {categories[active]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Placeholder({
  ids,
  left,
  width,
  top,
  height,
  strokeWidth,
  reduce,
}: {
  ids: { pulse: string; band: string; mask: string };
  left: number;
  width: number;
  top: number;
  height: number;
  strokeWidth: number;
  reduce: boolean;
}) {
  // A calm, slightly rising wave: reads as "a line goes here", not as data.
  const d = linePath(
    Array.from({ length: PLACEHOLDER_SAMPLES }, (_, i) => {
      const t = i / (PLACEHOLDER_SAMPLES - 1);
      return {
        x: left + t * width,
        y: top + height * (0.62 - t * 0.18 + Math.sin(t * Math.PI * 3) * 0.07),
      };
    }),
    "monotone",
  );
  const band = Math.max(80, width * 0.28);
  return (
    <motion.g
      className="text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
    >
      <defs>
        <linearGradient id={ids.band} x1="0" x2="1" y1="0" y2="0">
          <stop offset={0} stopColor="white" stopOpacity={0} />
          <stop offset={0.5} stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask id={ids.pulse} maskUnits="userSpaceOnUse" x={left - band} y={0} width={width + band * 2} height={top * 2 + height}>
          <motion.rect
            x={0}
            y={0}
            width={band}
            height={top * 2 + height}
            fill={`url(#${ids.band})`}
            initial={{ x: left - band }}
            animate={{ x: left + width }}
            transition={{ duration: 1.6, ease: EASE_IN_OUT, repeat: Infinity, repeatDelay: 0.35 }}
          />
        </mask>
      </defs>
      {/* Shares the plot's edge fade, so the handoff to real lines keeps its silhouette. */}
      <g mask={`url(#${ids.mask})`}>
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeOpacity: 0.22 }}
          animate={reduce ? { strokeOpacity: [0.22, 0.45, 0.22] } : { strokeOpacity: 0.22 }}
          transition={reduce ? { duration: 1.8, ease: EASE_IN_OUT, repeat: Infinity } : undefined}
        />
        {reduce ? null : (
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.75}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            mask={`url(#${ids.pulse})`}
          />
        )}
      </g>
    </motion.g>
  );
}

function Series({
  row,
  points,
  baseline,
  curve,
  area,
  fillOpacity,
  strokeWidth,
  hidden,
  dimmed,
}: {
  row: XYRow;
  points: (XYAnimatedPoint | null)[];
  baseline: MotionValue<number>;
  curve: XYCurve;
  area: boolean;
  fillOpacity: number;
  strokeWidth: number;
  hidden: boolean;
  dimmed: boolean;
}) {
  const gradientId = useId();
  const values = [baseline, ...points.flatMap((point) => (point ? [point.x, point.y] : []))];
  const read = (coordinates: number[]) => {
    let cursor = 1;
    return points.map((point) =>
      point ? { x: coordinates[cursor++], y: coordinates[cursor++] } : null,
    );
  };
  // SVG geometry has to reshape with the data; no transform of the whole path can express it.
  const line = useTransform(values, (coordinates: number[]) => linePath(read(coordinates), curve));
  const fill = useTransform(values, (coordinates: number[]) =>
    areaPath(read(coordinates), coordinates[0], curve),
  );
  return (
    <motion.g
      initial={false}
      animate={{ opacity: hidden ? 0 : dimmed ? 0.2 : 1 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
    >
      {area ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={row.color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={row.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path d={fill} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <motion.path
        d={line}
        fill="none"
        stroke={row.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
  );
}
