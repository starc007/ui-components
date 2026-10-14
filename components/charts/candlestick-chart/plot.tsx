"use client";

/* Candles fade up 12ms apart on first draw. The live candle's body, wick, and
 * volume bar spring to new values as trades print, and the last-price line
 * follows. Pointer or arrow keys move a crosshair with a price tag on the
 * axis. Every moving shape is drawn at unit height and placed with
 * translateY and scaleY, so updates animate transforms only. Reduced motion:
 * no fade or spring; values update in place. */

import { motion, type Transition } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useCandlestickChart } from "./context";

/** Right gutter reserved for price labels, in px. */
const AXIS = 64;
const VOLUME_SHARE = 0.18;
const GAP = 8;
/** Scale from the shape's own top edge rather than its centre. */
const TOP_ORIGIN = { originX: 0, originY: 0 } as const;

export type CandlestickChartPlotProps = {
  /** Plot height in px. */
  height?: number;
  className?: string;
};

export function CandlestickChartPlot({
  height = 320,
  className,
}: CandlestickChartPlotProps) {
  const { candles, lastPrice, active, setActive, scale, formatPrice, label, reduce } =
    useCandlestickChart();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pointerY, setPointerY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const plotWidth = Math.max(0, width - AXIS);
  const priceHeight = height * (1 - VOLUME_SHARE) - GAP;
  const slot = candles.length ? plotWidth / candles.length : 0;
  const body = Math.max(1, slot * 0.62);
  const y = (price: number) => ((scale.max - price) / (scale.max - scale.min || 1)) * priceHeight;
  const priceAt = (py: number) => scale.max - (py / priceHeight) * (scale.max - scale.min);
  const ticks = Array.from(
    { length: 5 },
    (_, i) => scale.max - ((scale.max - scale.min) * (i + 0.5)) / 5,
  );
  const spring: Transition = reduce ? { duration: 0 } : SPRING_LAYOUT;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    if (x > plotWidth || !slot) return;
    setActive(Math.min(candles.length - 1, Math.max(0, Math.floor(x / slot))));
    setPointerY(py <= priceHeight ? py : null);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const current = active ?? candles.length - 1;
    let next: number | null = current;
    if (event.key === "ArrowLeft") next = Math.max(0, current - 1);
    else if (event.key === "ArrowRight") next = Math.min(candles.length - 1, current + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = candles.length - 1;
    else if (event.key === "Escape") next = null;
    else return;
    event.preventDefault();
    setPointerY(null);
    setActive(next);
  };

  const focus = active !== null ? candles[active] : candles.at(-1);
  const crossX = active !== null ? active * slot + slot / 2 : null;

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, candles.length - 1)}
      aria-valuenow={active ?? Math.max(0, candles.length - 1)}
      aria-valuetext={
        focus
          ? `${focus.label}: open ${formatPrice(focus.open)}, high ${formatPrice(focus.high)}, low ${formatPrice(focus.low)}, close ${formatPrice(focus.close)}`
          : undefined
      }
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        setActive(null);
        setPointerY(null);
      }}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      className={cn(
        "relative w-full cursor-crosshair touch-pan-y select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      style={{ height }}
    >
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          className="absolute inset-0 overflow-visible"
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--border)"
              strokeDasharray="2 6"
            />
          ))}
          {candles.map((candle, index) => {
            const up = candle.close >= candle.open;
            const cx = index * slot + slot / 2;
            const top = y(Math.max(candle.open, candle.close));
            const bodyHeight = Math.max(1, Math.abs(y(candle.open) - y(candle.close)));
            const wickTop = y(candle.high);
            const wickHeight = Math.max(1, y(candle.low) - wickTop);
            const volumeHeight = Math.max(
              0.5,
              (candle.volume / scale.volumeMax) * height * VOLUME_SHARE,
            );
            const dimmed = active !== null && active !== index;
            return (
              <motion.g
                key={candle.id}
                className={
                  up ? "fill-emerald-500 stroke-emerald-500" : "fill-rose-500 stroke-rose-500"
                }
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: dimmed ? 0.45 : 1 }}
                transition={{
                  duration: 0.3,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : Math.min(index * 0.012, 0.6),
                }}
              >
                <motion.line
                  x1={cx}
                  x2={cx}
                  y1={0}
                  y2={1}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={1}
                  style={TOP_ORIGIN}
                  initial={false}
                  animate={{ y: wickTop, scaleY: wickHeight }}
                  transition={spring}
                />
                <motion.rect
                  x={cx - body / 2}
                  y={0}
                  width={body}
                  height={1}
                  strokeWidth={0}
                  style={TOP_ORIGIN}
                  initial={false}
                  animate={{ y: top, scaleY: bodyHeight }}
                  transition={spring}
                />
                <motion.rect
                  x={cx - body / 2}
                  y={0}
                  width={body}
                  height={1}
                  strokeWidth={0}
                  opacity={0.28}
                  style={TOP_ORIGIN}
                  initial={false}
                  animate={{ y: height - volumeHeight, scaleY: volumeHeight }}
                  transition={spring}
                />
              </motion.g>
            );
          })}
          {lastPrice !== undefined ? (
            <motion.line
              x1={0}
              x2={plotWidth}
              y1={0}
              y2={0}
              initial={false}
              animate={{ y: y(lastPrice) }}
              transition={spring}
              stroke="var(--foreground)"
              strokeOpacity={0.45}
              strokeDasharray="3 4"
            />
          ) : null}
          {crossX !== null ? (
            <line
              x1={crossX}
              x2={crossX}
              y1={0}
              y2={height}
              stroke="var(--foreground)"
              strokeOpacity={0.3}
            />
          ) : null}
          {pointerY !== null ? (
            <line
              x1={0}
              x2={plotWidth}
              y1={pointerY}
              y2={pointerY}
              stroke="var(--foreground)"
              strokeOpacity={0.3}
            />
          ) : null}
        </svg>
      ) : null}

      {width > 0
        ? ticks.map((tick) => (
            <span
              key={tick}
              className="pointer-events-none absolute right-0 -translate-y-1/2 pr-1 font-mono text-xs text-muted-foreground tabular-nums"
              style={{ top: y(tick) }}
            >
              {formatPrice(tick)}
            </span>
          ))
        : null}
      {width > 0 && lastPrice !== undefined ? (
        <motion.div
          className="pointer-events-none absolute top-0 right-0"
          initial={false}
          animate={{ y: y(lastPrice) }}
          transition={spring}
        >
          <span className="block -translate-y-1/2 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-xs text-background tabular-nums">
            {formatPrice(lastPrice)}
          </span>
        </motion.div>
      ) : null}
      {width > 0 && pointerY !== null ? (
        <span
          className="pointer-events-none absolute right-0 -translate-y-1/2 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground tabular-nums"
          style={{ top: pointerY }}
        >
          {formatPrice(priceAt(pointerY))}
        </span>
      ) : null}
    </div>
  );
}
