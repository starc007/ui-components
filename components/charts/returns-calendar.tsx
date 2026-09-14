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

const UP = "var(--success)";
const DOWN = "var(--destructive)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLS = MONTHS.map((name, m) => ({ name, initial: name[0], m }));
/** The compounded column, addressed like a thirteenth month. */
const YEAR = 12;

/** Compounded return of a run of percentages, in percent. */
const compound = (run: number[]) => (run.reduce((acc, r) => acc * (1 + r / 100), 1) - 1) * 100;

const signed = (v: number, dp: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(dp)}`;

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;

/** magnitude → strength of the one up or down hue, never a second color */
const tint = (v: number, range: number, on: boolean) =>
  `color-mix(in srgb, ${v >= 0 ? UP : DOWN} ${Math.round(Math.min(Math.abs(v) / range, 1) * 55 + (on ? 24 : 8))}%, transparent)`;

/** Zero-based row and month; month 12 selects the year total. */
export type ReturnsCalendarCell = { y: number; m: number };
type Hot = ReturnsCalendarCell;
const same = (a: Hot | null, y: number, m: number) => a?.y === y && a?.m === m;

const RING = "inset 0 0 0 1.5px var(--foreground)";

export interface ReturnsCalendarSelection {
  start: ReturnsCalendarCell;
  end?: ReturnsCalendarCell;
}

export interface ReturnsCalendarProps {
  /** Row labels, one per row of `returns`. */
  years?: number[];
  /** `returns[year][month]` in percent, twelve months per row. */
  returns?: number[][];
  className?: string;
  children?: ReactNode;
  selection?: ReturnsCalendarSelection | null;
  defaultSelection?: ReturnsCalendarSelection | null;
  onSelectionChange?: (selection: ReturnsCalendarSelection | null) => void;
}

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
function useReturnsCalendarModel({
  years = [],
  returns = [],
  selection: controlledSelection,
  defaultSelection = null,
  onSelectionChange,
}: ReturnsCalendarProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [storedHover, setHover] = useState<Hot | null>(null);
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
  const ci = (c: Hot) => c.y * 12 + c.m;
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

  const select = (cell: Hot) => {
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

const ReturnsCalendarContext = createContext<ReturnType<typeof useReturnsCalendarModel> | null>(null);

export function useReturnsCalendar() {
  const context = useContext(ReturnsCalendarContext);
  if (!context) throw new Error("ReturnsCalendar parts must be inside ReturnsCalendar");
  return context;
}

/** Compose Grid and Tooltip, or omit children for the complete chart. */
export function ReturnsCalendar({ children, className, ...props }: ReturnsCalendarProps) {
  const model = useReturnsCalendarModel(props);
  return (
    <ReturnsCalendarContext.Provider value={model}>
      <div className={cn("w-[480px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
        {children === undefined ? (
          <ReturnsCalendarGrid>
            <ReturnsCalendarTooltip />
          </ReturnsCalendarGrid>
        ) : (
          children
        )}
      </div>
    </ReturnsCalendarContext.Provider>
  );
}

export function ReturnsCalendarGrid({ children, className }: { children?: ReactNode; className?: string }) {
  const {
    years,
    reduce,
    canHover,
    pinned,
    settled,
    totals,
    valueAt,
    range,
    span,
    yearSpan,
    hot,
    sweepRow,
    enter,
    press,
    clearOnEscape,
    setHover,
    gridRef,
    tooltipId,
  } = useReturnsCalendar();
  return (
    <div
      ref={gridRef}
      className={cn("relative grid gap-1", className)}
      style={{ gridTemplateColumns: "32px repeat(12, 1fr) 52px" }}
      onPointerLeave={() => setHover(null)}
    >
      <span />
      {COLS.map((c) => (
        <span
          key={c.name}
          className={cn(
            "pb-1 text-center text-[10px] transition-colors duration-200",
            hot?.m === c.m ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {c.initial}
        </span>
      ))}
      <span
        className={cn(
          "pb-1 text-center text-[10px] transition-colors duration-200",
          hot?.m === YEAR ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Year
      </span>

      {years.map((year, y) => (
        <div key={year} className="contents">
          <span
            className={cn(
              "flex items-center justify-end pr-1.5 font-mono text-[10px] tabular-nums transition-colors duration-200",
              hot?.y === y ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {`’${String(year).slice(2)}`}
          </span>

          {COLS.map(({ name, m }) => {
            const v = valueAt(y, m);
            const i = y * 12 + m;
            const on = same(hot, y, m);
            const isEnd = span ? i === span.lo || i === span.hi : same(pinned, y, m);
            // a year span lights whole rows; months in the picked years stay lit, the rest dim
            const dim = span
              ? i < span.lo || i > span.hi
              : yearSpan
                ? y < yearSpan.lo || y > yearSpan.hi
                : !!hot && !on && hot.y !== y && hot.m !== m;
            const lift = settled && on && canHover && !reduce ? 1.15 : 1;
            return (
              // the outer span owns the dim so it never fights the transforms inside
              <span
                key={`${year}-${name}`}
                className="relative block aspect-square w-full transition-opacity duration-200"
                style={{ opacity: dim ? 0.35 : 1 }}
              >
                {/* the hit area is the cell plus half the gap on every side, so the grid
                      has no dead space; the visual inside never takes pointer events */}
                <motion.button
                  type="button"
                  data-return-cell={`${y}-${m}`}
                  aria-describedby={on ? tooltipId : undefined}
                  aria-label={`${MONTHS[m]} ${year} ${signed(v, 1)}%`}
                  aria-pressed={isEnd}
                  onPointerEnter={enter(y, m)}
                  onFocus={enter(y, m)}
                  onBlur={() => setHover(null)}
                  onClick={press(y, m)}
                  onKeyDown={clearOnEscape}
                  className="absolute -inset-0.5 block rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  whileTap={reduce ? undefined : { scale: 0.92, transition: SPRING_PRESS }}
                >
                  <motion.span
                    className="pointer-events-none absolute inset-0.5 grid place-items-center rounded-[4px] font-mono text-[9px] font-medium tabular-nums"
                    style={{
                      background: tint(v, range, on),
                      color: `color-mix(in srgb, var(--foreground) ${Math.round(85 + Math.min(Math.abs(v) / range, 1) * 15)}%, transparent)`,
                      boxShadow: isEnd ? RING : "none",
                      transition: "background 150ms, box-shadow 150ms",
                    }}
                    initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                    // the diagonal wave on entrance; after it lands the hovered cell lifts,
                    // and hovering the year total replays the row Jan to Dec
                    animate={
                      sweepRow === y && !reduce
                        ? {
                            opacity: 1,
                            // a gentle pulse: kept under the cell gap so a peaking cell
                            // never grows into its neighbours as the wave passes
                            scale: [1, 1.1, 1],
                            transition: { duration: 0.36, ease: EASE_OUT, delay: m * 0.035 },
                          }
                        : settled
                          ? { opacity: 1, scale: lift, transition: SPRING_PRESS }
                          : {
                              opacity: 1,
                              scale: 1,
                              transition: reduce
                                ? { duration: 0 }
                                : { ...SPRING_PRESS, delay: (y + m) * 0.02 },
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
                          className="pointer-events-none absolute inset-0 border-[1.5px]"
                          style={{ borderRadius: "inherit", borderColor: v >= 0 ? UP : DOWN }}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12, ease: EASE_OUT }}
                        />
                      ) : null}
                    </AnimatePresence>
                    {Math.abs(v) >= 4 ? Math.round(v) : ""}
                  </motion.span>
                </motion.button>
              </span>
            );
          })}

          <span
            className="relative block transition-opacity duration-200"
            style={{
              opacity: (
                span
                  ? y < Math.floor(span.lo / 12) || y > Math.floor(span.hi / 12)
                  : yearSpan
                    ? y < yearSpan.lo || y > yearSpan.hi
                    : hot && hot.y !== y
              )
                ? 0.35
                : 1,
            }}
          >
            <motion.button
              type="button"
              data-return-cell={`${y}-${YEAR}`}
              aria-describedby={same(hot, y, YEAR) ? tooltipId : undefined}
              aria-label={`${year} ${signed(totals[y], 1)}% for the year`}
              aria-pressed={yearSpan ? y === yearSpan.lo || y === yearSpan.hi : same(pinned, y, YEAR)}
              onPointerEnter={enter(y, YEAR)}
              onFocus={enter(y, YEAR)}
              onBlur={() => setHover(null)}
              onClick={press(y, YEAR)}
              onKeyDown={clearOnEscape}
              className="absolute -inset-0.5 block rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              whileTap={reduce ? undefined : { scale: 0.96, transition: SPRING_PRESS }}
            >
              <motion.span
                className="pointer-events-none absolute inset-0.5 grid place-items-center rounded-[4px] font-mono text-[11px] font-medium tabular-nums"
                // a neutral cell under the colored number: the tint of the same hue ate its contrast
                style={{
                  background: same(hot, y, YEAR)
                    ? "var(--background)"
                    : "color-mix(in srgb, var(--foreground) 6%, transparent)",
                  color: ink(totals[y] >= 0 ? UP : DOWN),
                  // the ends of a year span carry the locked ring, like a month span's ends
                  boxShadow: (yearSpan ? y === yearSpan.lo || y === yearSpan.hi : same(pinned, y, YEAR))
                    ? RING
                    : same(hot, y, YEAR)
                      ? "inset 0 0 0 1px var(--border-strong)"
                      : "none",
                  transition: "background 150ms, box-shadow 150ms",
                }}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT, delay: 0.02 * (y + 13) }
                }
              >
                {/* the year total gets the same flush hover ring as the month cells,
                      unless it already carries a span-end ring */}
                <AnimatePresence>
                  {same(hot, y, YEAR) &&
                  !(yearSpan ? y === yearSpan.lo || y === yearSpan.hi : same(pinned, y, YEAR)) ? (
                    <motion.span
                      className="pointer-events-none absolute inset-0 border-[1.5px]"
                      style={{ borderRadius: "inherit", borderColor: totals[y] >= 0 ? UP : DOWN }}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12, ease: EASE_OUT }}
                    />
                  ) : null}
                </AnimatePresence>
                {signed(totals[y], 0)}%
              </motion.span>
            </motion.button>
          </span>
        </div>
      ))}

      {children}
    </div>
  );
}

export interface ReturnsCalendarTooltipData {
  label: string;
  value: number;
  note: string | null;
}

export function ReturnsCalendarTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: ReturnsCalendarTooltipData) => ReactNode);
  className?: string;
}) {
  const { gridRef, tooltipId, tip, tipValue, tipLabel, tipNote } = useReturnsCalendar();
  const data = { label: tipLabel, value: tipValue, note: tipNote };
  return (
    <ChartTooltip
      open={tip !== null}
      id={tooltipId}
      containerRef={gridRef}
      point={{ x: 0, y: 0 }}
      anchor={tip ? `[data-return-cell="${tip.y}-${tip.m}"]` : undefined}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {typeof children === "function"
        ? children(data)
        : (children ?? (
            <>
              <span className="text-muted-foreground">{tipLabel}</span>
              <span
                className="inline-flex items-center font-mono tabular-nums"
                style={{ color: ink(tipValue >= 0 ? UP : DOWN) }}
              >
                <NumberTicker
                  value={Math.round(Math.abs(tipValue) * 10)}
                  format={(v) => (v / 10).toFixed(1)}
                  prefix={tipValue >= 0 ? "+" : "−"}
                  suffix="%"
                  duration={0.35}
                  startOnView={false}
                />
              </span>
              {tipNote ? <span className="text-muted-foreground">{tipNote}</span> : null}
            </>
          ))}
    </ChartTooltip>
  );
}
