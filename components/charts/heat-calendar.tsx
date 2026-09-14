"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { ChartTooltip } from "@/components/charts/shared/chart-tooltip";
import { cn } from "@/lib/utils";

/** Five buckets: 0 is the neutral empty cell, 1 to 4 mix the one hue in harder. */
const STEPS = [0, 24, 46, 70, 94] as const;
const EMPTY = "color-mix(in srgb, var(--foreground) 6%, transparent)";

/** Cell size and gap; every position in the grid and the tooltip derive from these. */
const CELL = 16;
const GAP = 4;
const PITCH = CELL + GAP;
const MONTH_ROW = 12;

const DAYS = Array.from({ length: 7 }, (_, d) => ({ id: `d${d}`, d }));

/** How far a cell rises when it is the hovered one, its neighbour, or two away. */
const LIFT = [1.3, 1.08, 1.03];

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};
/** Monday on or before `d`, so every column reads Mon to Sun, top to bottom. */
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getUTCDay() + 6) % 7));

const fmtDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});
const fmtMonth = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" });
const fmtRange = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });

export type HeatCalendarCell = { w: number; d: number };

export interface HeatCalendarSelection {
  start: HeatCalendarCell;
  end?: HeatCalendarCell;
}

export interface HeatCalendarProps {
  /** Noun after every count, e.g. "commits", "ships". */
  unit?: string;
  /** Number of week columns. */
  weeks?: number;
  /** Count a cell at intensity 1 stands for; a cell reads `intensity × maxCount`. */
  maxCount?: number;
  /** `values[week][day]` intensities in 0..1, seven days per week. Missing values are zero. */
  values?: number[][];
  /** Last UTC calendar day of the grid. Defaults to today after mount; explicit dates render identically in every timezone. */
  endDate?: Date;
  /** The single hue. Any CSS color; magnitude maps to its strength, never to a second color. */
  color?: string;
  className?: string;
  children?: ReactNode;
  /** Controlled selection; null clears it. Cell coordinates are zero-based week/day (Monday first). */
  selection?: HeatCalendarSelection | null;
  defaultSelection?: HeatCalendarSelection | null;
  onSelectionChange?: (selection: HeatCalendarSelection | null) => void;
}

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
function useHeatCalendarModel({
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

const HeatCalendarContext = createContext<ReturnType<typeof useHeatCalendarModel> | null>(null);

/** Read the shared data and selection from any descendant of HeatCalendar. */
export function useHeatCalendar() {
  const context = useContext(HeatCalendarContext);
  if (!context) throw new Error("HeatCalendar parts must be inside HeatCalendar");
  return context;
}

/** Compose Grid, Tooltip and Legend, or omit children for the complete chart. */
export function HeatCalendar({ children, className, ...props }: HeatCalendarProps) {
  const model = useHeatCalendarModel(props);
  return (
    <HeatCalendarContext.Provider value={model}>
      <div className={cn("w-fit max-w-full", className)}>
        {children === undefined ? (
          <>
            <HeatCalendarGrid>
              <HeatCalendarTooltip />
            </HeatCalendarGrid>
            <HeatCalendarLegend />
          </>
        ) : (
          children
        )}
      </div>
    </HeatCalendarContext.Provider>
  );
}

export function HeatCalendarGrid({ children, className }: { children?: ReactNode; className?: string }) {
  const {
    weeks,
    reduce,
    canHover,
    pinned,
    step,
    settled,
    level,
    bucket,
    fill,
    count,
    dateOf,
    future,
    cols,
    clear,
    span,
    select,
    hot,
    hotMonth,
    setHover,
    gridRef,
    tooltipId,
    unit,
  } = useHeatCalendar();
  return (
    <div
      ref={gridRef}
      className={cn("relative grid", className)}
      style={{
        width: weeks * PITCH - GAP,
        maxWidth: "100%",
        gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
        gridTemplateRows: `${MONTH_ROW}px repeat(7, auto)`,
        gap: GAP,
      }}
      onPointerLeave={() => setHover(null)}
    >
      {cols.map((c) =>
        c.label ? (
          <span
            key={c.id}
            className={cn(
              "whitespace-nowrap text-[10px] leading-none transition-colors duration-200",
              hotMonth === c.m ? "text-foreground" : "text-muted-foreground",
            )}
            style={{ gridColumn: c.w + 1, gridRow: 1 }}
          >
            {c.label}
          </span>
        ) : null,
      )}
      {cols.map(({ id, w }) =>
        DAYS.map(({ id: dayId, d }) => {
          const date = dateOf(w, d);
          if (future(w, d)) return null;
          const v = level(w, d);
          const b = bucket(v);
          const i = w * 7 + d;
          const on = hot?.w === w && hot?.d === d;
          const isEnd = span ? i === span.lo || i === span.hi : pinned?.w === w && pinned?.d === d;
          const dim = (step !== null && step !== b) || (span !== null && (i < span.lo || i > span.hi));
          // the ripple: the hovered cell rises most, the ring around it a little, two out barely
          const dist = hot ? Math.max(Math.abs(hot.w - w), Math.abs(hot.d - d)) : 9;
          const lift =
            reduce || !canHover ? 1 : dist === 0 ? LIFT[0] : canHover && dist < LIFT.length ? LIFT[dist] : 1;
          return (
            // the outer span owns the legend dim so it never fights the transforms inside
            <span
              key={`${id}-${dayId}`}
              className="relative block aspect-square w-full transition-opacity duration-200"
              style={{
                gridColumn: w + 1,
                gridRow: d + 2,
                opacity: dim ? 0.25 : 1,
                zIndex: lift > 1 ? LIFT.length - dist : 0,
              }}
            >
              {/* the hit area is the cell plus half the gap on every side, so the grid
                    has no dead space between cells and a fast pointer never falls through;
                    the visual inside never takes pointer events, so a lifted neighbour
                    cannot steal a click either */}
              <motion.button
                type="button"
                aria-label={`${count(v)} ${unit}${date ? ` on ${fmtDay.format(date)}` : ""}`}
                data-heat-cell={`${w}-${d}`}
                aria-pressed={isEnd}
                aria-describedby={on ? tooltipId : undefined}
                onPointerEnter={() => setHover({ w, d })}
                onFocus={() => setHover({ w, d })}
                onBlur={() => setHover(null)}
                onClick={() => select({ w, d })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") clear();
                }}
                className="absolute -inset-0.5 block rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                whileTap={reduce ? undefined : { scale: 0.9, transition: SPRING_PRESS }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-0.5 block rounded-[4px]"
                  style={{
                    background: fill(b),
                    boxShadow: isEnd ? "0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)" : "none",
                    transition: "box-shadow 150ms",
                  }}
                  // the diagonal wave: each cell arrives (w + d) steps after the corner;
                  // once settled, the ripple spreads out from the hovered cell by distance
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={
                    settled
                      ? {
                          opacity: 1,
                          scale: lift,
                          transition: { ...SPRING_PRESS, delay: Math.min(dist, 3) * 0.03 },
                        }
                      : {
                          opacity: 1,
                          scale: 1,
                          transition: reduce ? { duration: 0 } : { ...SPRING_PRESS, delay: (w + d) * 0.018 },
                        }
                  }
                >
                  {/* the ring lives INSIDE the cell: inset-0 fills its box and
                        borderRadius:inherit copies its corner, so it always shares the
                        cell's exact size, scale (hover lift included) and roundness and
                        cannot drift however the cells are restyled */}
                  <AnimatePresence>
                    {on && !isEnd ? (
                      <motion.span
                        className="pointer-events-none absolute inset-0 block border-[1.5px]"
                        style={{
                          borderRadius: "inherit",
                          borderColor: "color-mix(in srgb, var(--foreground) 55%, transparent)",
                        }}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12, ease: EASE_OUT }}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.span>
              </motion.button>
            </span>
          );
        }),
      )}

      {children}
    </div>
  );
}

export function HeatCalendarLegend({ className }: { className?: string }) {
  const { start, end, step, setStep, fill, canHover, reduce } = useHeatCalendar();
  return (
    <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-3", className)}>
      <span className="text-xs text-muted-foreground">
        {start && end ? `${fmtRange.format(start)} – ${fmtRange.format(end)}` : "\u00a0"}
      </span>
      {/* hovering a step keeps only cells of that level lit, so the legend doubles as a filter */}
      <span className="flex items-center gap-1" onPointerLeave={() => setStep(null)}>
        <span className="mr-0.5 text-xs text-muted-foreground">less</span>
        {STEPS.map((s, i) => (
          <button
            type="button"
            aria-label={`Show activity level ${i}`}
            aria-pressed={step === i}
            key={s}
            onPointerEnter={() => {
              if (canHover) setStep(i);
            }}
            onFocus={() => setStep(i)}
            onBlur={() => setStep(null)}
            onClick={() => setStep(step === i ? null : i)}
            className="size-3 rounded-[3px] transition-transform duration-150"
            style={{ background: fill(i), transform: !reduce && step === i ? "scale(1.25)" : undefined }}
          />
        ))}
        <span className="ml-0.5 text-xs text-muted-foreground">more</span>
      </span>
    </div>
  );
}

export function HeatCalendarTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: NonNullable<ReturnType<typeof useHeatCalendar>["tooltip"]>) => ReactNode);
  className?: string;
}) {
  const { gridRef, tooltipId, tipX, tipY, tip, tooltip, unit } = useHeatCalendar();
  return (
    <ChartTooltip
      open={tooltip !== null}
      id={tooltipId}
      containerRef={gridRef}
      point={{ x: tipX, y: tipY }}
      anchor={tip ? `[data-heat-cell="${tip.w}-${tip.d}"]` : undefined}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {tooltip &&
        (typeof children === "function"
          ? children(tooltip)
          : (children ?? (
              <>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <NumberTicker
                    value={tooltip.days > 1 ? tooltip.total : tooltip.count}
                    duration={0.35}
                    startOnView={false}
                  />{" "}
                  {unit}
                </span>
                <span className="text-muted-foreground">
                  {tooltip.days > 1 && tooltip.startDate && tooltip.endDate
                    ? `${fmtRange.format(tooltip.startDate)} – ${fmtRange.format(tooltip.endDate)}`
                    : fmtDay.format(tooltip.date)}
                </span>
                {tooltip.days > 1 ? <span className="text-muted-foreground">{tooltip.days} days</span> : null}
              </>
            )))}
    </ChartTooltip>
  );
}
