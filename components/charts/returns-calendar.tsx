"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_GLIDE, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

const UP = "var(--success)";
const DOWN = "var(--destructive)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLS = MONTHS.map((name, m) => ({ name, initial: name[0], m }));
/** The compounded column, addressed like a thirteenth month. */
const YEAR = 12;

const DEFAULT_YEARS = [2021, 2022, 2023, 2024, 2025];

/** Deterministic sample field so every render agrees; 2022 reads as a down year. */
const DEFAULT_RETURNS: number[][] = (() => {
  let seed = 2021;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return DEFAULT_YEARS.map((_, yi) =>
    MONTHS.map(() => Math.round(((yi === 1 ? -1.6 : 0.9) + (rnd() - 0.5) * 12) * 10) / 10),
  );
})();

/** Compounded return of a run of percentages, in percent. */
const compound = (run: number[]) => (run.reduce((acc, r) => acc * (1 + r / 100), 1) - 1) * 100;

const signed = (v: number, dp: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(dp)}`;

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;

/** magnitude → strength of the one up or down hue, never a second color */
const tint = (v: number, range: number, on: boolean) =>
  `color-mix(in srgb, ${v >= 0 ? UP : DOWN} ${Math.round(Math.min(Math.abs(v) / range, 1) * 55 + (on ? 24 : 8))}%, transparent)`;

/** A hovered or selected cell, with its box inside the grid so the tooltip can hang from it. */
type Hot = { y: number; m: number; left: number; width: number; top: number };
/** Reads the box of the cell wrapper (the button inside it bleeds into the gaps). */
const hotFrom = (el: HTMLElement, y: number, m: number): Hot => {
  const box = el.parentElement ?? el;
  return { y, m, left: box.offsetLeft, width: box.offsetWidth, top: box.offsetTop };
};
const same = (a: Hot | null, y: number, m: number) => a?.y === y && a?.m === m;

const RING = "inset 0 0 0 1.5px var(--foreground)";

// The tooltip mirrors Tooltip's top-side variants so the two read as one family:
// it rises out of the cell with a short blur, and leaves faster than it came.
const TIP: Variants = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(5px)", y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 30,
      mass: 0.7,
      opacity: { duration: 0.14, ease: EASE_OUT },
      filter: { duration: 0.18, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    filter: "blur(3px)",
    y: 5,
    transition: { duration: 0.12, ease: EASE_OUT },
  },
};
const TIP_REDUCED: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.14, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } },
};

export interface ReturnsCalendarProps {
  /** Row labels, one per row of `returns`. */
  years?: number[];
  /** `returns[year][month]` in percent, twelve months per row. */
  returns?: number[][];
  className?: string;
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
export function ReturnsCalendar({
  years = DEFAULT_YEARS,
  returns = DEFAULT_RETURNS,
  className,
}: ReturnsCalendarProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [hover, setHover] = useState<Hot | null>(null);
  const [pinned, setPinned] = useState<Hot | null>(null);
  const [spanEnd, setSpanEnd] = useState<Hot | null>(null);
  // the entrance wave owns the cells until it has landed; hover lifts take over after
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), reduce ? 0 : (years.length + 13) * 20 + 500);
    return () => clearTimeout(t);
  }, [years.length, reduce]);

  const totals = useMemo(() => returns.map(compound), [returns]);
  /** every month in order, so a span is one slice */
  const flat = useMemo(() => returns.flat(), [returns]);

  const valueAt = (y: number, m: number) => returns[y]?.[m] ?? 0;
  /** percent that saturates a month's tint */
  const range = 8;

  // one click on a month anchors a span and dims everything else; hovering then
  // previews the run from the anchor to the pointer and compounds it live, a
  // second click locks it, and the next click anywhere clears it
  const ci = (c: Hot) => c.y * 12 + c.m;
  const clear = () => {
    setPinned(null);
    setSpanEnd(null);
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
    else if (pinned && (pinned.m === YEAR) === (cell.m === YEAR)) setSpanEnd(cell);
    else {
      setPinned(cell);
      setSpanEnd(null);
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
  const tipNote = showYearSpan && yearSpan
    ? `${yearSpan.hi - yearSpan.lo + 1} years`
    : showSpan && span
      ? `${span.hi - span.lo + 1} months`
      : tip?.m === YEAR
        ? "for the year"
        : null;
  // near either edge the tooltip hangs from the cell's outer corner instead of its center
  const align = tip ? (tip.m <= 1 ? "start" : tip.m >= 10 ? "end" : "center") : "center";
  const tipX = tip ? tip.left + (align === "start" ? 0 : align === "end" ? tip.width : tip.width / 2) : 0;
  const tipY = tip ? tip.top : 0;

  const enter = (y: number, m: number) => (e: { currentTarget: HTMLElement }) =>
    setHover(hotFrom(e.currentTarget, y, m));
  const press = (y: number, m: number) => (e: { currentTarget: HTMLElement }) =>
    select(hotFrom(e.currentTarget, y, m));
  const clearOnEscape = (e: { key: string }) => {
    if (e.key === "Escape") clear();
  };

  return (
    <div className={cn("w-[480px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
      <div
        className="relative grid gap-1"
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
                                transition: reduce ? { duration: 0 } : { ...SPRING_PRESS, delay: (y + m) * 0.02 },
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
                  transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT, delay: 0.02 * (y + 13) }}
                >
                  {/* the year total gets the same flush hover ring as the month cells,
                      unless it already carries a span-end ring */}
                  <AnimatePresence>
                    {same(hot, y, YEAR) && !(yearSpan ? y === yearSpan.lo || y === yearSpan.hi : same(pinned, y, YEAR)) ? (
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

        <AnimatePresence>
          {tip ? (
            <motion.div
              key="tip"
              className="pointer-events-none absolute left-0 top-0 z-10"
              initial={false}
              animate={{ x: tipX, y: tipY }}
              transition={reduce ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE }}
            >
              <motion.div
                role="tooltip"
                variants={reduce ? TIP_REDUCED : TIP}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  "absolute bottom-1.5 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-lg",
                  align === "end" ? "right-0" : "left-0",
                )}
                style={{ x: align === "center" ? "-50%" : 0, transformOrigin: "bottom center" }}
              >
                <span className="text-muted-foreground">{tipLabel}</span>
                {/* the tooltip stays put while the pointer walks the grid; only its number rolls */}
                <span className="inline-flex items-center font-mono tabular-nums" style={{ color: ink(tipValue >= 0 ? UP : DOWN) }}>
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
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
