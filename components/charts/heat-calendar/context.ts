"use client";

import { useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import type { HeatCalendarCell, HeatCalendarProps, HeatCalendarSelection } from "./types";
import { addDays, CELL, EMPTY, fmtMonth, GAP, MONTH_ROW, mondayOf, PITCH, STEPS, startOfDay } from "./utils";

/**
 * Weeks of activity as a single-hue grid with month labels, so
 * magnitude reads as the strength of one color and the eye needs no legend
 * to find a date. Cells spring in on a diagonal wave. Hovering one lifts it
 * and its neighbours in a small ripple and glides a tooltip with its date and
 * exact count; clicking pins the cell so touch and keyboard get the same
 * readout; from there the grid dims and hovering previews the span from that
 * cell to the pointer with its total, a second click locks it and a third
 * clears it; hovering a legend step filters
 * the grid to that level. Hover lifts are gated to pointer devices, and
 * reduced motion keeps the fades only.
 */
export function useHeatCalendarModel({
  unit = "commits",
  weeks = 16,
  maxCount = 14,
  values,
  endDate,
  color = "var(--accent)",
  selection: controlledSelection,
  defaultSelection = null,
  onSelectionChange,
}: HeatCalendarProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [storedHover, setHover] = useState<HeatCalendarCell | null>(null);
  const [internalSelection, setInternalSelection] = useState(defaultSelection);
  const requestedSelection = controlledSelection === undefined ? internalSelection : controlledSelection;
  const setSelection = (next: HeatCalendarSelection | null) => {
    if (controlledSelection === undefined) setInternalSelection(next);
    onSelectionChange?.(next);
  };
  const gridRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [step, setStep] = useState<number | null>(null);
  // the entrance wave owns the cells until it has landed; the ripple takes over after
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), reduce ? 0 : (weeks + 7) * 18 + 500);
    return () => clearTimeout(t);
  }, [weeks, reduce]);

  // "today" is read after mount: the server and a viewer on another calendar
  // day must produce the same HTML, so the grid renders first and its dates
  // fill in on the client. An explicit `endDate` is deterministic and skips this.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(startOfDay(new Date())), []);
  const end = useMemo(() => (endDate ? startOfDay(endDate) : today), [endDate, today]);
  const start = useMemo(() => (end ? addDays(mondayOf(end), -(weeks - 1) * 7) : null), [end, weeks]);

  const level = (w: number, d: number) => Math.max(0, Math.min(1, values?.[w]?.[d] ?? 0));
  const bucket = (v: number) => Math.min(4, Math.floor(v * 5));
  const fill = (b: number) => (b === 0 ? EMPTY : `color-mix(in srgb, ${color} ${STEPS[b]}%, transparent)`);
  const count = (v: number) => Math.round(v * maxCount);
  const dateOf = (w: number, d: number) => (start ? addDays(start, w * 7 + d) : null);
  const future = (w: number, d: number) => {
    const date = dateOf(w, d);
    return end !== null && date !== null && date > end;
  };

  const validCell = (cell: HeatCalendarCell) =>
    Number.isInteger(cell.w) &&
    Number.isInteger(cell.d) &&
    cell.w >= 0 &&
    cell.w < weeks &&
    cell.d >= 0 &&
    cell.d < 7 &&
    !future(cell.w, cell.d);
  const selection =
    requestedSelection &&
    validCell(requestedSelection.start) &&
    (!requestedSelection.end || validCell(requestedSelection.end))
      ? requestedSelection
      : null;
  if (requestedSelection && !selection && controlledSelection === undefined) setInternalSelection(null);
  const pinned = selection?.start ?? null;
  const spanEnd = selection?.end ?? null;
  const hover = storedHover && validCell(storedHover) ? storedHover : null;
  if (storedHover && !hover) setHover(null);

  // one label per month, at its first column; the leading label yields if the
  // next month starts within two columns, so two labels never overlap
  const cols = useMemo(() => {
    const list = Array.from({ length: weeks }, (_, w) => {
      const date = start ? addDays(start, w * 7) : null;
      const m = date ? date.getUTCMonth() : -1;
      const fresh =
        start !== null && date !== null && (w === 0 || addDays(start, (w - 1) * 7).getUTCMonth() !== m);
      return { id: `w${w}`, w, m, label: fresh && date ? fmtMonth.format(date) : null };
    });
    if (list[1]?.label || list[2]?.label) list[0].label = null;
    return list;
  }, [start, weeks]);

  // one click anchors a span and dims everything else; hovering then previews
  // the run from the anchor to the pointer and totals it live, and a second
  // click locks it so the number stays on screen while the pointer moves on
  const idx = (c: HeatCalendarCell) => c.w * 7 + c.d;
  const clear = () => {
    setSelection(null);
  };
  const spanTo = spanEnd ?? (pinned ? (hover ?? pinned) : null);
  const span =
    pinned && spanTo
      ? { lo: Math.min(idx(pinned), idx(spanTo)), hi: Math.max(idx(pinned), idx(spanTo)) }
      : null;
  let spanTotal = 0;
  if (span) {
    for (let i = span.lo; i <= span.hi; i++) {
      if (future(Math.floor(i / 7), i % 7)) break;
      spanTotal += count(level(Math.floor(i / 7), i % 7));
    }
  }
  const select = (cell: HeatCalendarCell) => {
    // a locked span clears on the next click anywhere, so leaving it is one press
    if (spanEnd) {
      clear();
    } else if (pinned && idx(pinned) === idx(cell)) {
      setSelection(null);
    } else if (pinned) {
      setSelection({ start: pinned, end: cell });
    } else {
      setSelection({ start: cell });
    }
  };
  /** the cell the grid reacts to: lift, ripple and label highlight follow the pointer */
  const hot = hover ?? spanEnd ?? pinned;
  /** the cell the tooltip hangs from: a locked span keeps it on its end */
  const tip = spanEnd ?? hover ?? pinned;
  const tipDate = tip ? dateOf(tip.w, tip.d) : null;
  const hotMonth = hot ? (dateOf(hot.w, hot.d)?.getUTCMonth() ?? null) : null;
  const tipX = tip ? tip.w * PITCH + CELL / 2 : 0;
  const tipY = tip ? MONTH_ROW + GAP + tip.d * PITCH : 0;
  const tooltip =
    tip && tipDate
      ? {
          date: tipDate,
          count: count(level(tip.w, tip.d)),
          total: spanTotal,
          startDate: start && span ? addDays(start, span.lo) : tipDate,
          endDate: start && span ? addDays(start, span.hi) : tipDate,
          days: span ? span.hi - span.lo + 1 : 1,
        }
      : null;

  return {
    unit,
    weeks,
    reduce,
    canHover,
    hover,
    pinned,
    spanEnd,
    step,
    setStep,
    settled,
    start,
    end,
    level,
    bucket,
    fill,
    count,
    dateOf,
    future,
    cols,
    clear,
    span,
    spanTotal,
    select,
    hot,
    tip,
    tipDate,
    hotMonth,
    tipX,
    tipY,
    setHover,
    gridRef,
    tooltipId,
    tooltip,
    selection,
    setSelection,
  };
}

export const HeatCalendarContext = createContext<ReturnType<typeof useHeatCalendarModel> | null>(null);

/** Read the shared data and selection from any descendant of HeatCalendar. */
export function useHeatCalendar() {
  const context = useContext(HeatCalendarContext);
  if (!context) throw new Error("HeatCalendar parts must be inside HeatCalendar");
  return context;
}
