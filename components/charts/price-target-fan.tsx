"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_GLIDE, SPRING_PANEL } from "@/lib/ease";
import { ChartTooltip } from "@/components/charts/shared/chart-tooltip";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

/** e.g. "Mon, Jul 15" — the scrub read-out's date. */
const fmtScrubDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

const UP = "var(--success)";
const MID = "var(--accent)";
const LOW = "var(--warning)";

export interface PriceTarget {
  key: string;
  price: number;
  analysts: number;
  /** Any CSS color; the projection, its dot and its label take it. */
  color?: string;
}

const W = 520;
const H = 236;
const PAD = { l: 36, r: 108, t: 16, b: 28 };

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;

export interface PriceHistoryPoint {
  date: string;
  price: number;
}
export type PriceTargetFanActive = { type: "history"; date: string } | { type: "target"; key: string };
const EMPTY_HISTORY: PriceHistoryPoint[] = [];

export interface PriceTargetFanProps {
  /** Accessible name of the chart. */
  label?: string;
  /** Last traded price; the history walks to this point. */
  current: number;
  /** High, mean and low targets, in that order. */
  targets: [PriceTarget, PriceTarget, PriceTarget];
  /** Axis labels, oldest to horizon. */
  dates?: { start?: string; mid?: string; horizon?: string };
  /** Actual prices, oldest first, using ISO dates. Empty history renders only the current price and targets. */
  history?: PriceHistoryPoint[];
  children?: ReactNode;
  active?: PriceTargetFanActive | null;
  defaultActive?: PriceTargetFanActive | null;
  onActiveChange?: (active: PriceTargetFanActive | null) => void;
  className?: string;
}

/**
 * Analyst price targets. A year of history draws itself to now, then three
 * dashed projections fan out to the high, mean and low targets. The hot target
 * owns the header: its price rolls in on the shared NumberTicker and its
 * projection draws itself solid; the mean takes the header back on leave.
 * Scrubbing the history or hovering a target glides a value card
 * beside the point on a spring, one metric per row. Targets are focusable and
 * a tap toggles them on touch; Escape lets go. The now dot sends a slow ring
 * outward as the live-price signal. Reduced motion shows the finished chart,
 * moves the card without travel, and drops the ring.
 */
function usePriceTargetFanModel({
  label = "Price target · 12 months",
  current,
  targets,
  dates = {},
  history = EMPTY_HISTORY,
  active: controlledActive,
  defaultActive = null,
  onActiveChange,
}: PriceTargetFanProps) {
  const reduce = useReducedMotion();
  const clipId = useId();
  const fadeId = `${clipId}-fade`;
  const svgRef = useRef<SVGSVGElement>(null);
  const canHover = useHoverCapable();
  const tooltipId = useId();
  const [internalActive, setInternalActive] = useState(defaultActive);
  const requestedActive = controlledActive === undefined ? internalActive : controlledActive;
  const setActive = (next: PriceTargetFanActive | null) => {
    if (controlledActive === undefined) setInternalActive(next);
    onActiveChange?.(next);
  };
  const targetIndex =
    requestedActive?.type === "target"
      ? targets.findIndex((target) => target.key === requestedActive.key)
      : -1;
  const historyIndex =
    requestedActive?.type === "history"
      ? history.findIndex((point) => point.date === requestedActive.date)
      : -1;
  const active = targetIndex >= 0 || historyIndex >= 0 ? requestedActive : null;
  if (requestedActive && !active && controlledActive === undefined) setInternalActive(null);
  const hotT = targetIndex >= 0 ? targetIndex : null;
  const scrub = historyIndex >= 0 ? historyIndex : null;
  const setHotT = (index: number | null) =>
    setActive(index === null ? null : { type: "target", key: targets[index].key });
  const setScrub = (index: number | null) =>
    setActive(index === null ? null : { type: "history", date: history[index].date });
  const hist = useMemo(() => {
    let previous = Number.NEGATIVE_INFINITY;
    return history.map((point) => {
      const time = Date.parse(point.date);
      if (
        !/^\d{4}-\d{2}-\d{2}(?:T.*(?:Z|[+-]\d{2}:\d{2}))?$/.test(point.date) ||
        !Number.isFinite(time) ||
        time <= previous ||
        !Number.isFinite(point.price) ||
        point.price <= 0
      ) {
        throw new RangeError(
          "PriceTargetFan history must contain positive prices and ascending, unique ISO dates",
        );
      }
      previous = time;
      return point.price;
    });
  }, [history]);
  if (
    !Number.isFinite(current) ||
    current <= 0 ||
    targets.length !== 3 ||
    targets.some((target) => !Number.isFinite(target.price) || target.price <= 0) ||
    new Set(targets.map((target) => target.key)).size !== 3
  ) {
    throw new RangeError(
      "PriceTargetFan requires a positive current price and three positive targets with unique keys",
    );
  }
  // the domain follows the data: whatever history and targets arrive, the
  // chart fills its height instead of assuming a $150-250 stock
  const yLo = Math.min(current, ...hist, ...targets.map((t) => t.price));
  const yHi = Math.max(current, ...hist, ...targets.map((t) => t.price));
  const yPad = Math.max((yHi - yLo) * 0.06, 0.5);
  const yMin = yLo - yPad;
  const yMax = yHi + yPad;
  const y = useCallback(
    (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b),
    [yMin, yMax],
  );
  const pct = (p: number) => ((p - current) / current) * 100;
  const fmt = (p: number) => `$${p.toFixed(2)}`;

  const geo = useMemo(() => {
    const histW = (W - PAD.l - PAD.r) * 0.56;
    const nowX = PAD.l + histW;
    const times = history.map((point) => Date.parse(point.date));
    const first = times[0] ?? 0;
    const last = times[times.length - 1] ?? first;
    const hx = (i: number) =>
      last === first ? nowX - 12 : PAD.l + ((times[i] - first) / (last - first)) * (histW - 12);
    const nowY = y(current);
    const endX = W - PAD.r;
    const line =
      hist.map((v, i) => `${i === 0 ? "M" : "L"}${hx(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ") +
      (hist.length ? ` L${nowX},${nowY}` : "");
    const proj = targets.map((t, i) => {
      const ty = y(t.price);
      const cx = nowX + (endX - nowX) * 0.5;
      const cy = nowY + (ty - nowY) * 0.15;
      const color = t.color ?? [UP, MID, LOW][i];
      return { ...t, color, ty, d: `M${nowX},${nowY} Q${cx},${cy} ${endX},${ty}`, cx, cy };
    });
    return { hx, nowX, nowY, endX, line, proj };
  }, [hist, history, targets, current, y]);

  const onMove = (e: React.PointerEvent) => {
    if (!canHover || e.pointerType === "touch") return;
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px > geo.nowX + 6) {
      // in the fan the nearest projection owns the pointer, so the card walks
      // from high to mean to low as the pointer drifts instead of dropping out
      const py = ((e.clientY - r.top) / r.height) * H;
      const t = Math.min(1, (px - geo.nowX) / (geo.endX - geo.nowX));
      let nearest = 0;
      let best = Number.POSITIVE_INFINITY;
      const ys = geo.proj.map((p) => (1 - t) * (1 - t) * geo.nowY + 2 * (1 - t) * t * p.cy + t * t * p.ty);
      ys.forEach((cy, i) => {
        const d = Math.abs(py - cy);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      // right after now the three curves still overlap; picking one there would be a guess
      const spread = Math.max(...ys) - Math.min(...ys);
      setHotT(spread < 24 ? null : nearest);
      return;
    }
    if (!hist.length || px > geo.nowX - 6) {
      setActive(null);
      return;
    }
    let nearest = 0;
    for (let i = 1; i < hist.length; i++) {
      if (Math.abs(geo.hx(i) - px) < Math.abs(geo.hx(nearest) - px)) nearest = i;
    }
    setScrub(nearest);
  };

  // a hovered target wins over the scrub; the card sits on whichever side keeps it in view
  const overlay = (() => {
    if (hotT !== null) {
      const p = geo.proj[hotT];
      const up = p.price >= current;
      return {
        px: geo.endX,
        py: p.ty,
        // the horizon rides in the faint header so the target has a date without a row
        title: `${p.key} target${dates.horizon ? ` · ${dates.horizon}` : ""}`,
        // one metric per row, label against value; the move sits alone under a hairline
        metrics: [
          { label: "Price", value: fmt(p.price) },
          { label: "Analysts", value: String(p.analysts) },
        ],
        accent: {
          label: "vs now",
          value: `${up ? "+" : "−"}${Math.abs(pct(p.price)).toFixed(1)}%`,
          color: p.color as string,
        } as { label: string; value: string; color: string } | null,
      };
    }
    if (scrub !== null) {
      const title = fmtScrubDate.format(new Date(history[scrub].date));
      return {
        px: geo.hx(scrub),
        py: y(hist[scrub]),
        title,
        metrics: [{ label: "Price", value: fmt(hist[scrub]) }],
        accent: null as { label: string; value: string; color: string } | null,
      };
    }
    return null;
  })();

  const mean = targets[1];
  // whichever target is hot owns the header; the mean holds it otherwise
  const head = hotT !== null ? geo.proj[hotT] : { key: mean.key, price: mean.price, color: undefined };
  const headPct = pct(head.price);
  // round-numbered gridlines derived from the domain, at most four of them
  const gridVals = useMemo(() => {
    const span = yMax - yMin;
    const mag = 10 ** Math.floor(Math.log10(span / 3.2));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= 4.2) ?? 10 * mag;
    const out: number[] = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) out.push(v);
    return { step, out };
  }, [yMin, yMax]);
  const drawn = reduce ? { duration: 0 } : undefined;

  return {
    reduce,
    clipId,
    fadeId,
    svgRef,
    tooltipId,
    active,
    setActive,
    scrub,
    hotT,
    setHotT,
    setScrub,
    hist,
    history,
    current,
    targets,
    dates,
    label,
    y,
    pct,
    fmt,
    geo,
    overlay,
    mean,
    head,
    headPct,
    gridVals,
    drawn,
    onMove,
  };
}

const fmtAxisDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "numeric" }).format(
    new Date(date),
  );
const PriceTargetFanContext = createContext<ReturnType<typeof usePriceTargetFanModel> | null>(null);

export function usePriceTargetFan() {
  const context = useContext(PriceTargetFanContext);
  if (!context) throw new Error("PriceTargetFan parts must be inside PriceTargetFan");
  return context;
}

/** Owns chart data and interaction; children may replace or rearrange the default parts. */
export function PriceTargetFan({ children, className, ...props }: PriceTargetFanProps) {
  const model = usePriceTargetFanModel(props);
  return (
    <PriceTargetFanContext.Provider value={model}>
      <div className={cn("w-[520px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
        {children === undefined ? (
          <>
            <PriceTargetFanHeader />
            <PriceTargetFanPlot />
          </>
        ) : (
          children
        )}
      </div>
    </PriceTargetFanContext.Provider>
  );
}

export function PriceTargetFanHeader({ children, className }: { children?: ReactNode; className?: string }) {
  const { head, headPct } = usePriceTargetFan();
  return (
    <div className={cn("mb-1 flex items-end justify-between px-1", className)}>
      {children ?? (
        <div className="flex flex-wrap items-center gap-2">
          <NumberTicker
            value={Math.round(head.price * 100)}
            format={(v) => (v / 100).toFixed(2)}
            prefix="$"
            duration={0.5}
            className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground"
          />
          <span
            className="font-mono text-xs font-medium tabular-nums"
            style={{ color: ink((head.color as string | undefined) ?? (headPct >= 0 ? UP : LOW)) }}
          >
            <NumberTicker
              value={Math.round(Math.abs(headPct) * 10)}
              format={(v) => (v / 10).toFixed(1)}
              prefix={headPct >= 0 ? "+" : "−"}
              suffix="%"
              duration={0.5}
            />
          </span>
          <span className="text-xs text-muted-foreground">{head.key} target</span>
        </div>
      )}
    </div>
  );
}

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

export function PriceTargetFanHistory({ className }: { className?: string }) {
  const { hist, history, scrub, setScrub, setActive, tooltipId, fmt, geo, reduce, drawn } =
    usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {hist.length ? (
        <g
          role="slider"
          tabIndex={0}
          aria-label="Price history"
          aria-valuemin={0}
          aria-valuemax={hist.length - 1}
          aria-valuenow={scrub ?? hist.length - 1}
          aria-valuetext={`${history[scrub ?? hist.length - 1].date}: ${fmt(hist[scrub ?? hist.length - 1])}`}
          aria-describedby={scrub !== null ? tooltipId : undefined}
          onFocus={() => setScrub(hist.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            const index = scrub ?? hist.length - 1;
            if (event.key === "Escape") {
              event.preventDefault();
              setActive(null);
            } else if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              setScrub(
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? hist.length - 1
                    : Math.max(0, Math.min(hist.length - 1, index + (event.key === "ArrowRight" ? 1 : -1))),
              );
            }
          }}
        >
          {" "}
          {/* history draws itself to now */}
          <motion.path
            data-price-history=""
            d={geo.line}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={drawn ?? { duration: 0.9, ease: EASE_OUT }}
          />
        </g>
      ) : null}
    </g>
  );
}

export function PriceTargetFanTargets({ className }: { className?: string }) {
  const { geo, hotT, setHotT, setActive, tooltipId, clipId, reduce, drawn, fmt } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* projections and target labels */}
      <g clipPath={`url(#${clipId})`}>
        {geo.proj.map((p, i) => {
          const on = hotT === i;
          const dim = hotT !== null && !on;
          return (
            <motion.g
              key={p.key}
              role="button"
              tabIndex={0}
              aria-label={`${p.key} target ${fmt(p.price)}, ${p.analysts} analysts`}
              className="outline-none"
              aria-pressed={on}
              aria-describedby={on ? tooltipId : undefined}
              initial={{ opacity: 1 }}
              animate={{ opacity: dim ? 0.3 : 1 }}
              transition={drawn ?? { duration: 0.25, ease: EASE_OUT }}
              onFocus={() => setHotT(i)}
              onBlur={() => setHotT(null)}
              // a tap toggles on touch, where hover never fires; mouse and pen keep hover
              onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                  e.preventDefault();
                  setHotT(on ? null : i);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setActive(null);
                }
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHotT(on ? null : i);
                }
              }}
            >
              <path d={p.d} fill="none" stroke="transparent" strokeWidth={16} />
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={on ? 2.2 : 1.4}
                strokeOpacity={on ? 1 : 0.75}
                strokeDasharray="2 4"
                strokeLinecap="round"
              />
              {/* the hot projection draws itself solid over the dashes, base to target */}
              {on && (
                <motion.path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={drawn ?? { duration: 0.35, ease: EASE_OUT }}
                />
              )}
              <motion.circle
                cx={geo.endX}
                cy={p.ty}
                fill="var(--background)"
                stroke={p.color}
                strokeWidth={1.6}
                r={3.2}
                animate={{ r: on ? 4.5 : 3.2 }}
                transition={drawn ?? SPRING_PANEL}
              />
              <text
                x={geo.endX + 10}
                y={p.ty + 4}
                fontSize={11}
                fontWeight={600}
                fill={ink(p.color)}
                className="font-mono tabular-nums"
              >
                {p.price}
              </text>
            </motion.g>
          );
        })}
      </g>
    </g>
  );
}

export function PriceTargetFanNow({ className }: { className?: string }) {
  const { geo, reduce, drawn } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* the now dot lands as the history arrives */}
      <motion.circle
        cx={geo.nowX}
        cy={geo.nowY}
        r={3.2}
        fill="var(--foreground)"
        initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={drawn ?? { ...SPRING_PANEL, delay: 0.85 }}
        style={{ transformOrigin: `${geo.nowX}px ${geo.nowY}px` }}
      />
      {/* the live tail: a ring leaves the now dot every few seconds */}
      {!reduce && (
        <motion.circle
          cx={geo.nowX}
          cy={geo.nowY}
          r={3.2}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={1}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0.45, 0], scale: [1, 2.8] }}
          transition={{
            duration: 2.2,
            ease: EASE_OUT,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 1.6,
            delay: 1.6,
          }}
          style={{ transformOrigin: `${geo.nowX}px ${geo.nowY}px` }}
        />
      )}
    </g>
  );
}

export function PriceTargetFanCursor({ className }: { className?: string }) {
  const { scrub, geo, y, hist, fadeId, reduce } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* the scrub crosshair: it flows along the history on a spring instead of
              stepping cell to cell, so a slow drag reads as one continuous read-out */}
      {scrub !== null && (
        <g pointerEvents="none">
          <motion.line
            y1={PAD.t}
            y2={H - PAD.b}
            stroke={`url(#${fadeId})`}
            strokeWidth={1}
            initial={false}
            animate={{ x1: geo.hx(scrub), x2: geo.hx(scrub) }}
            transition={reduce ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE }}
          />
          <motion.circle
            r={3.2}
            fill="var(--foreground)"
            stroke="var(--background)"
            strokeWidth={1.5}
            initial={false}
            animate={{ cx: geo.hx(scrub), cy: y(hist[scrub]) }}
            transition={reduce ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE }}
          />
        </g>
      )}
    </g>
  );
}

export function PriceTargetFanTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: NonNullable<ReturnType<typeof usePriceTargetFan>["overlay"]>) => ReactNode);
  className?: string;
}) {
  const { svgRef, tooltipId, overlay } = usePriceTargetFan();
  return (
    <ChartTooltip
      open={overlay !== null}
      id={tooltipId}
      containerRef={svgRef}
      point={{ x: overlay?.px ?? 0, y: overlay?.py ?? 0 }}
      viewBox={{ width: W, height: H }}
      className={cn("w-[148px] rounded-xl px-3 py-2.5", className)}
    >
      {overlay &&
        (typeof children === "function"
          ? children(overlay)
          : (children ?? (
              <>
                <span className="block text-[10px] text-muted-foreground">{overlay.title}</span>
                <span className="mt-1.5 flex flex-col gap-1">
                  {overlay.metrics.map((metric) => (
                    <span key={metric.label} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-foreground">{metric.label}</span>
                      <span className="font-mono tabular-nums text-foreground">{metric.value}</span>
                    </span>
                  ))}
                </span>
                {overlay.accent ? (
                  <span className="mt-1.5 flex items-center justify-between gap-3 border-t border-border pt-1.5 text-xs">
                    <span className="font-medium text-foreground">{overlay.accent.label}</span>
                    <span className="font-mono tabular-nums" style={{ color: ink(overlay.accent.color) }}>
                      {overlay.accent.value}
                    </span>
                  </span>
                ) : null}
              </>
            )))}
    </ChartTooltip>
  );
}
