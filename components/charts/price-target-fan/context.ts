"use client";

import { useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import type { PriceTargetFanActive, PriceTargetFanProps } from "./types";
import { EMPTY_HISTORY, fmtScrubDate, H, LOW, MID, PAD, UP, W } from "./utils";

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
export function usePriceTargetFanModel({
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

export const PriceTargetFanContext = createContext<ReturnType<typeof usePriceTargetFanModel> | null>(null);

export function usePriceTargetFan() {
  const context = useContext(PriceTargetFanContext);
  if (!context) throw new Error("PriceTargetFan parts must be inside PriceTargetFan");
  return context;
}
