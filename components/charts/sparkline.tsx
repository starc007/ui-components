"use client";

/* A compact trend for tables, stat cards and inline text. New values morph the
 * line on the same springs as LineChart, and the end dot follows. With
 * `interactive`, hovering, dragging or arrow keys move a dot along the line and
 * the readout shows that sample. Reduced motion: values update in place. */

import { motion, useReducedMotion, useTransform } from "motion/react";
import { type ComponentProps, useId, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";
import { XYInspector } from "./xy/inspector";
import { areaPath, linePath, type XYCurve } from "./xy/path";
import { useAnimatedPoints, type XYPointTarget } from "./xy/use-points";
import { useElementWidth } from "./xy/use-width";

export interface SparklineProps extends Omit<ComponentProps<"div">, "children"> {
  /** Samples in display order. Missing or non-finite values leave a gap. */
  data: readonly (number | null)[];
  /** Optional sample labels, such as dates, used by the interactive readout. */
  labels?: readonly string[];
  /** Accessible name, such as "Revenue, last 30 days". */
  label: string;
  variant?: "line" | "area";
  curve?: XYCurve;
  /** Any CSS color. Defaults to the current text color. */
  color?: string;
  /** Height in px. Width follows the container. */
  height?: number;
  strokeWidth?: number;
  /** Show the change from the first to the last sample as a badge. */
  showDelta?: boolean;
  /** Color a fall green and a rise red, for metrics where lower is better, such as error rate. */
  invertDelta?: boolean;
  /** Hover, drag or arrow keys to read individual samples. Adds one tab stop. */
  interactive?: boolean;
  formatValue?: (value: number) => string;
}

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const PAD = 3;

export function Sparkline({
  data,
  labels,
  label,
  variant = "line",
  curve = "monotone",
  color = "currentColor",
  height = 32,
  strokeWidth = 1.5,
  showDelta = false,
  invertDelta = false,
  interactive = false,
  formatValue = (value) => number.format(value),
  className,
  ...props
}: SparklineProps) {
  const reduce = useReducedMotion() ?? false;
  const canHover = useHoverCapable();
  const gradientId = useId();
  const tooltipId = useId();
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  // Under a finger the readout dot tracks the touch directly instead of gliding.
  const [touching, setTouching] = useState(false);
  const values = data.map((value) =>
    typeof value === "number" && Number.isFinite(value) ? value : null,
  );
  const present = values.filter((value): value is number => value !== null);
  // Fit the data tightly: at this size a zero baseline or rounded bounds would
  // flatten a metric that sits far from zero. The area fills to the bottom edge.
  const lo = present.length ? Math.min(...present) : 0;
  const hi = present.length ? Math.max(...present) : 1;
  const range = hi - lo || 1;
  const n = values.length;
  const x = (i: number) => PAD + (n === 1 ? (width - PAD * 2) / 2 : (i / (n - 1)) * (width - PAD * 2));
  const y = (value: number) =>
    hi === lo ? height / 2 : PAD + ((hi - value) / range) * (height - PAD * 2);

  const targets: XYPointTarget[] = [];
  if (width > 0) {
    targets.push({ key: "baseline", x: 0, y: height });
    values.forEach((value, i) => {
      if (value !== null) targets.push({ key: String(i), x: x(i), y: y(value) });
    });
  }
  const points = useAnimatedPoints(targets, reduce, width);
  // Indexed by position: a live sparkline shifts every sample left as it ticks.
  const ordered = values.map((value, i) => (value === null ? null : (points.get(String(i)) ?? null)));
  const baseline = points.get("baseline");
  const motionValues = [
    ...(baseline ? [baseline.y] : []),
    ...ordered.flatMap((point) => (point ? [point.x, point.y] : [])),
  ];
  const read = (coordinates: number[]) => {
    let cursor = 1;
    return ordered.map((point) =>
      point ? { x: coordinates[cursor++], y: coordinates[cursor++] } : null,
    );
  };
  const line = useTransform(motionValues, (c: number[]) => (baseline ? linePath(read(c), curve) : ""));
  const fill = useTransform(motionValues, (c: number[]) =>
    baseline ? areaPath(read(c), c[0], curve) : "",
  );

  const lastIndex = values.findLastIndex((value) => value !== null);
  const firstIndex = values.findIndex((value) => value !== null);
  const last = lastIndex >= 0 ? (values[lastIndex] as number) : null;
  const first = firstIndex >= 0 ? (values[firstIndex] as number) : null;
  const delta = first !== null && last !== null && first !== 0 ? ((last - first) / Math.abs(first)) * 100 : null;
  const trend = delta === null || Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";
  const tone = trend === "flat" ? "flat" : (trend === "up") !== invertDelta ? "good" : "bad";
  const inspecting = interactive && open && active !== null && values[active] !== null;
  const dotIndex = inspecting ? (active as number) : lastIndex;
  const dotValue = dotIndex >= 0 ? values[dotIndex] : null;
  const name = (i: number) => labels?.[i] ?? `Sample ${i + 1}`;
  const summary = [
    label,
    first !== null && last !== null ? `from ${formatValue(first)} to ${formatValue(last)}` : "no data",
    delta !== null && trend !== "flat" ? `${trend} ${Math.abs(delta).toFixed(1)}%` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      {...props}
      data-slot="sparkline"
      className={cn("inline-flex w-full min-w-0 items-center gap-2", className)}
    >
      <div ref={ref} className="relative min-w-0 flex-1" style={{ height, color }}>
        <svg
          role="img"
          aria-label={summary}
          width={width || undefined}
          height={height}
          className="absolute inset-0 overflow-visible"
        >
          {variant === "area" ? (
            <>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
              </defs>
              <motion.path d={fill} fill={`url(#${gradientId})`} />
            </>
          ) : null}
          <motion.path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {width > 0 && dotValue !== null && dotValue !== undefined ? (
            <motion.circle
              r={inspecting ? 3.5 : 2.5}
              cx={0}
              cy={0}
              fill="currentColor"
              stroke="var(--background)"
              strokeWidth={inspecting ? 2 : 0}
              initial={false}
              animate={{ x: x(dotIndex), y: y(dotValue) }}
              transition={reduce || touching ? { duration: 0 } : SPRING_LAYOUT}
            />
          ) : null}
        </svg>
        {interactive && present.length ? (
          <div className="absolute inset-0 rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring">
            <XYInspector
              count={n}
              activeIndex={active ?? -1}
              onActive={setActive}
              label={`${label}: inspect samples`}
              valueText={(i) => {
                const value = values[i];
                return `${name(i)}: ${value === null ? "no data" : formatValue(value)}`;
              }}
              mode="point"
              open={open}
              setOpen={setOpen}
              onTouchChange={setTouching}
              tooltipId={tooltipId}
              canHover={canHover}
              className="inset-0 size-full"
            />
          </div>
        ) : null}
      </div>
      {interactive && present.length ? (
        <span
          id={tooltipId}
          aria-hidden={!inspecting}
          className="shrink-0 text-right text-xs leading-tight tabular-nums"
        >
          <span className="block font-mono">
            {dotValue !== null && dotValue !== undefined ? (
              <NumberTicker
                value={dotValue}
                format={() => formatValue(dotValue)}
                startOnView={false}
                duration={0.2}
                stagger={0}
                className="whitespace-pre"
              />
            ) : (
              "No data"
            )}
          </span>
          <motion.span
            className="block text-[10px] text-muted-foreground"
            initial={false}
            animate={{ opacity: inspecting ? 1 : 0 }}
            transition={{ duration: 0.12, ease: EASE_OUT }}
          >
            {inspecting ? name(active as number) : " "}
          </motion.span>
        </span>
      ) : null}
      {showDelta && delta !== null ? (
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
            tone === "good" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tone === "bad" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            tone === "flat" && "bg-muted text-muted-foreground",
          )}
        >
          {trend === "up" ? "+" : trend === "down" ? "−" : ""}
          {Math.abs(delta).toFixed(1)}%
        </span>
      ) : null}
    </div>
  );
}
