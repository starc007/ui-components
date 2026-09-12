"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_GLIDE, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** e.g. "Mon, Jul 15" — the scrub read-out's date. */
const fmtScrubDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

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
const CARD_W = 148;

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;


/** Deterministic weekly history that ends exactly at `current`. */
function buildHistory(current: number): number[] {
  let s = 17;
  let v = 150;
  const out: number[] = [];
  for (let i = 0; i < 52; i++) {
    s = (s * 16807) % 2147483647;
    v = v + (s / 2147483647 - 0.44) * 4.2;
    out.push(v);
  }
  const lo = Math.min(...out);
  const hi = Math.max(...out);
  const scaled = out.map((x) => 158 + ((x - lo) / (hi - lo)) * 26);
  const shift = current - scaled[scaled.length - 1];
  return scaled.map((x) => x + shift);
}

const DEFAULT_TARGETS: [PriceTarget, PriceTarget, PriceTarget] = [
  { key: "High", price: 232, analysts: 9, color: UP },
  { key: "Mean", price: 205, analysts: 34, color: MID },
  { key: "Low", price: 168, analysts: 6, color: LOW },
];

export interface PriceTargetFanProps {
  /** Accessible name of the chart. */
  label?: string;
  /** Last traded price; the history walks to this point. */
  current?: number;
  /** High, mean and low targets, in that order. */
  targets?: [PriceTarget, PriceTarget, PriceTarget];
  /** Axis labels, oldest to horizon. */
  dates?: { start: string; mid: string; horizon: string };
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
export function PriceTargetFan({
  label = "Price target · 12 months",
  current = 178.52,
  targets = DEFAULT_TARGETS,
  dates = { start: "Jul 2025", mid: "Jan 2026", horizon: "Jul 2027" },
  className,
}: PriceTargetFanProps) {
  const reduce = useReducedMotion();
  const clipId = useId();
  const fadeId = `${clipId}-fade`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hotT, setHotT] = useState<number | null>(null);
  // "today" anchors the weekly history to real dates; read after mount so the
  // server and a viewer on another day render the same HTML first
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d);
  }, []);

  const hist = useMemo(() => buildHistory(current), [current]);
  // the domain follows the data: whatever history and targets arrive, the
  // chart fills its height instead of assuming a $150-250 stock
  const yLo = Math.min(...hist, ...targets.map((t) => t.price));
  const yHi = Math.max(...hist, ...targets.map((t) => t.price));
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
    const hx = (i: number) => PAD.l + (i / (hist.length - 1)) * histW;
    const nowX = hx(hist.length - 1);
    const nowY = y(current);
    const endX = W - PAD.r;
    const line = hist
      .map((v, i) => `${i === 0 ? "M" : "L"}${hx(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    const proj = targets.map((t, i) => {
      const ty = y(t.price);
      const cx = nowX + (endX - nowX) * 0.5;
      const cy = nowY + (ty - nowY) * 0.15;
      const color = t.color ?? [UP, MID, LOW][i];
      return { ...t, color, ty, d: `M${nowX},${nowY} Q${cx},${cy} ${endX},${ty}`, cx, cy };
    });
    return { hx, nowX, nowY, endX, line, proj };
  }, [hist, targets, current, y]);

  const onMove = (e: React.PointerEvent) => {
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
      setScrub(null);
      return;
    }
    setHotT(null);
    const histW = geo.nowX - PAD.l;
    setScrub(
      Math.max(0, Math.min(hist.length - 1, Math.round(((px - PAD.l) / histW) * (hist.length - 1)))),
    );
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
        title: `${p.key} target · ${dates.horizon}`,
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
      // the last history point is today; each earlier one is a week back
      const ago = hist.length - 1 - scrub;
      let title = ago === 0 ? "Today" : `${ago}w ago`;
      if (today) {
        const d = new Date(today);
        d.setDate(d.getDate() - ago * 7);
        title = fmtScrubDate.format(d);
      }
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
  const cardX = overlay
    ? overlay.px < W / 2
      ? Math.min(W - CARD_W - 4, overlay.px + 14)
      : Math.max(4, overlay.px - CARD_W - 14)
    : 0;
  // the clamp knows the card's height: title, a row per metric, the accent under its hairline
  const cardH = overlay ? 40 + overlay.metrics.length * 21 + (overlay.accent ? 30 : 0) : 0;
  const cardY = overlay ? Math.max(2, Math.min(H - cardH, overlay.py - 20)) : 0;
  const drawn = reduce ? { duration: 0 } : undefined;

  return (
    <div className={cn("w-[520px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
      {/* the header belongs to the hot target: hovering High rolls the big
          figure to its price on the shared NumberTicker, and the mean takes
          it back on leave */}
      <div className="mb-1 flex items-end justify-between px-1">
        <div className="flex items-center gap-2">
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
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full cursor-crosshair [&_*]:cursor-crosshair"
          role="img"
          aria-label={`${label}: mean ${fmt(mean.price)}, now ${fmt(current)}`}
          onPointerMove={onMove}
          onPointerLeave={() => {
            setScrub(null);
            setHotT(null);
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
                initial={{ width: reduce ? geo.endX - geo.nowX + 40 : 0 }}
                animate={{ width: geo.endX - geo.nowX + 40 }}
                transition={drawn ?? { duration: 0.8, ease: EASE_OUT, delay: 0.85 }}
              />
            </clipPath>
          </defs>

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
            { x: geo.hx(0), t: dates.start, a: "start" as const },
            { x: geo.hx(26), t: dates.mid, a: "middle" as const },
            { x: geo.nowX, t: "Now", a: "middle" as const },
            { x: geo.endX, t: dates.horizon, a: "middle" as const },
          ].map((d) => (
            <text
              key={d.t}
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

          {/* history draws itself to now */}
          <motion.path
            d={geo.line}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={drawn ?? { duration: 0.9, ease: EASE_OUT }}
          />

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
                  animate={{ opacity: dim ? 0.3 : 1 }}
                  transition={drawn ?? { duration: 0.25, ease: EASE_OUT }}
                  onFocus={() => setHotT(i)}
                  onBlur={() => setHotT(null)}
                  // a tap toggles on touch, where hover never fires; mouse and pen keep hover
                  onPointerDown={(e) => {
                    if (e.pointerType === "touch") setHotT(on ? null : i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") (e.currentTarget as SVGGElement).blur();
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
              transition={{ duration: 2.2, ease: EASE_OUT, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.6, delay: 1.6 }}
              style={{ transformOrigin: `${geo.nowX}px ${geo.nowY}px` }}
            />
          )}

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
        </svg>

        {/* the value card: it glides between points on a critically damped spring */}
        {overlay && (
          <motion.div
            // the same surface as Tooltip: page background, hairline, soft shadow
            className="pointer-events-none absolute left-0 top-0 z-10 rounded-xl border border-border bg-background px-3 py-2.5 shadow-lg"
            style={{ width: CARD_W }}
            initial={reduce ? false : { opacity: 0, scale: 0.96, x: cardX, y: cardY }}
            animate={{ opacity: 1, scale: 1, x: cardX, y: cardY }}
            transition={
              reduce
                ? { duration: 0 }
                : { x: SPRING_GLIDE, y: SPRING_GLIDE, opacity: { duration: 0.15 }, scale: SPRING_PANEL }
            }
          >
            <div className="text-[10px] text-muted-foreground">{overlay.title}</div>
            <div className="mt-1.5 flex flex-col gap-1">
              {overlay.metrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{m.label}</span>
                  <span className="font-mono tabular-nums text-foreground">{m.value}</span>
                </div>
              ))}
            </div>
            {overlay.accent ? (
              <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-border pt-1.5 text-xs">
                <span className="font-medium text-foreground">{overlay.accent.label}</span>
                <span className="font-mono tabular-nums" style={{ color: ink(overlay.accent.color) }}>
                  {overlay.accent.value}
                </span>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
