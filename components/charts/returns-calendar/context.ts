"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import type { ReturnsCalendarCell, ReturnsCalendarProps, ReturnsCalendarSelection } from "./types";
import { compound, MONTHS, same, YEAR } from "./utils";

/**
 * Monthly returns as a years by months grid. Each cell tints toward the up or
 * down color by magnitude, and a compounded year column closes every row.
 * Cells spring in on a diagonal wave. Hovering a month glides a tooltip with
 * its value and dims everything that shares neither its row nor its column;
 * hovering a year total replays that row month by month. Clicking a month
 * anchors a span: the grid dims, hovering previews the run from that month to
 * the pointer with its compounded return, a second click locks it and a third
 * clears it. The Year column selects the same way but by whole years — anchor a
 * year, a second year spans every month between them. Hover lifts are gated to
 * pointer devices, and reduced motion keeps the fades only.
 */
export function useReturnsCalendarModel({
  years = [],
  returns = [],
  selection: controlledSelection,
  defaultSelection = null,
  onSelectionChange,
}: ReturnsCalendarProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [storedHover, setHover] = useState<ReturnsCalendarCell | null>(null);
  const [internalSelection, setInternalSelection] = useState(defaultSelection);
  const requestedSelection = controlledSelection === undefined ? internalSelection : controlledSelection;
  const validCell = (cell: ReturnsCalendarCell) =>
    Number.isInteger(cell.y) &&
    Number.isInteger(cell.m) &&
    cell.y >= 0 &&
    cell.y < years.length &&
    cell.m >= 0 &&
    cell.m <= YEAR;
  const selection =
    requestedSelection &&
    validCell(requestedSelection.start) &&
    (!requestedSelection.end ||
      (validCell(requestedSelection.end) &&
        (requestedSelection.start.m === YEAR) === (requestedSelection.end.m === YEAR)))
      ? requestedSelection
      : null;
  if (requestedSelection && !selection && controlledSelection === undefined) setInternalSelection(null);
  const hover = storedHover && validCell(storedHover) ? storedHover : null;
  if (storedHover && !hover) setHover(null);
  const pinned = selection?.start ?? null;
  const spanEnd = selection?.end ?? null;
  const setSelection = (next: ReturnsCalendarSelection | null) => {
    if (controlledSelection === undefined) setInternalSelection(next);
    onSelectionChange?.(next);
  };
  const gridRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  // the entrance wave owns the cells until it has landed; hover lifts take over after
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), reduce ? 0 : (years.length + 13) * 20 + 500);
    return () => clearTimeout(t);
  }, [years.length, reduce]);

  // Normalize each displayed row to twelve months so missing values never
  // shift the following year's positions when a span is compounded.
  const rows = useMemo(
    () => years.map((_, y) => MONTHS.map((_, m) => returns[y]?.[m] ?? 0)),
    [years, returns],
  );
  const totals = useMemo(() => rows.map(compound), [rows]);
  /** every month in order, so a span is one slice */
  const flat = useMemo(() => rows.flat(), [rows]);

  const valueAt = (y: number, m: number) => returns[y]?.[m] ?? 0;
  /** percent that saturates a month's tint */
  const range = 8;

  // one click on a month anchors a span and dims everything else; hovering then
  // previews the run from the anchor to the pointer and compounds it live, a
  // second click locks it, and the next click anywhere clears it
  const ci = (c: ReturnsCalendarCell) => c.y * 12 + c.m;
  const clear = () => {
    setSelection(null);
  };
  const anchored = pinned !== null && pinned.m !== YEAR;
  const spanTo = spanEnd ?? (anchored && hover && hover.m !== YEAR ? hover : null);
  const span =
    anchored && pinned
      ? spanTo
        ? { lo: Math.min(ci(pinned), ci(spanTo)), hi: Math.max(ci(pinned), ci(spanTo)) }
        : { lo: ci(pinned), hi: ci(pinned) }
      : null;
  const spanValue = span ? compound(flat.slice(span.lo, span.hi + 1)) : 0;

  // the Year column runs its own selection: anchor a year, then a second year
  // spans whole years and compounds every month between them
  const yearAnchored = pinned !== null && pinned.m === YEAR;
  const yearTo = spanEnd ?? (yearAnchored && hover && hover.m === YEAR ? hover : null);
  const yearSpan =
    yearAnchored && pinned
      ? { lo: Math.min(pinned.y, (yearTo ?? pinned).y), hi: Math.max(pinned.y, (yearTo ?? pinned).y) }
      : null;
  const yearSpanValue = yearSpan ? compound(flat.slice(yearSpan.lo * 12, (yearSpan.hi + 1) * 12)) : 0;

  const select = (cell: ReturnsCalendarCell) => {
    if (spanEnd || same(pinned, cell.y, cell.m)) clear();
    // extend within the same track — month→month or year→year; a different track re-anchors
    else if (pinned && (pinned.m === YEAR) === (cell.m === YEAR)) setSelection({ start: pinned, end: cell });
    else {
      setSelection({ start: cell });
    }
  };

  /** the cell the grid reacts to: lift, labels and the year replay follow the pointer */
  const hot = hover ?? spanEnd ?? pinned;
  /** the cell the tooltip hangs from: a locked span keeps it on its end */
  const tip = spanEnd ?? hover ?? pinned;
  // the year replay is a plain-hover flourish; hold it back while a year span is being built
  const sweepRow = !yearAnchored && hot?.m === YEAR ? hot.y : null;
  const showSpan = span !== null && span.lo !== span.hi;
  const showYearSpan = yearSpan !== null && yearSpan.lo !== yearSpan.hi;
  const tipValue = showYearSpan
    ? yearSpanValue
    : showSpan && span
      ? spanValue
      : tip
        ? tip.m === YEAR
          ? totals[tip.y]
          : valueAt(tip.y, tip.m)
        : 0;
  const tipLabel =
    showYearSpan && yearSpan
      ? `${years[yearSpan.lo]} – ${years[yearSpan.hi]}`
      : showSpan && span
        ? `${MONTHS[span.lo % 12]} ${years[Math.floor(span.lo / 12)]} – ${MONTHS[span.hi % 12]} ${years[Math.floor(span.hi / 12)]}`
        : tip
          ? tip.m === YEAR
            ? `${years[tip.y]}`
            : `${MONTHS[tip.m]} ${years[tip.y]}`
          : "";
  const tipNote =
    showYearSpan && yearSpan
      ? `${yearSpan.hi - yearSpan.lo + 1} years`
      : showSpan && span
        ? `${span.hi - span.lo + 1} months`
        : tip?.m === YEAR
          ? "for the year"
          : null;
  const enter = (y: number, m: number) => () => setHover({ y, m });
  const press = (y: number, m: number) => () => select({ y, m });
  const clearOnEscape = (e: { key: string }) => {
    if (e.key === "Escape") clear();
  };

  return {
    years,
    reduce,
    canHover,
    hover,
    pinned,
    spanEnd,
    settled,
    totals,
    valueAt,
    range,
    clear,
    span,
    yearSpan,
    hot,
    tip,
    sweepRow,
    tipValue,
    tipLabel,
    tipNote,
    enter,
    press,
    clearOnEscape,
    setHover,
    gridRef,
    tooltipId,
    selection,
    setSelection,
  };
}


export const ReturnsCalendarContext = createContext<ReturnType<typeof useReturnsCalendarModel> | null>(null);

export function useReturnsCalendar() {
  const context = useContext(ReturnsCalendarContext);
  if (!context) throw new Error("ReturnsCalendar parts must be inside ReturnsCalendar");
  return context;
}


