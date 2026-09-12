"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT, SPRING_GLIDE, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

/** Deterministic demo field so every render agrees; weekends run quieter. */
function demoLevel(week: number, day: number) {
  const s = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
  const r = s - Math.floor(s);
  return day >= 5 ? Math.max(0, r - 0.55) * 1.4 : r;
}

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
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
/** Monday on or before `d`, so every column reads Mon to Sun, top to bottom. */
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short" });
const fmtRange = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

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

type Cell = { w: number; d: number };

export interface HeatCalendarProps {
  /** Noun after every count, e.g. "commits", "ships". */
  unit?: string;
  /** Number of week columns. */
  weeks?: number;
  /** Count a cell at intensity 1 stands for; a cell reads `intensity × maxCount`. */
  maxCount?: number;
  /** `values[week][day]` intensities in 0..1, seven days per week. Defaults to a deterministic demo field. */
  values?: number[][];
  /** Last day of the grid. Defaults to today; the grid ends on that day's week. */
  endDate?: Date;
  /** The single hue. Any CSS color; magnitude maps to its strength, never to a second color. */
  color?: string;
  className?: string;
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
export function HeatCalendar({
  unit = "commits",
  weeks = 16,
  maxCount = 14,
  values,
  endDate,
  color = "var(--accent)",
  className,
}: HeatCalendarProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [hover, setHover] = useState<Cell | null>(null);
  const [pinned, setPinned] = useState<Cell | null>(null);
  const [spanEnd, setSpanEnd] = useState<Cell | null>(null);
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

  const level = (w: number, d: number) => values?.[w]?.[d] ?? demoLevel(w, d);
  const bucket = (v: number) => Math.min(4, Math.floor(v * 5));
  const fill = (b: number) => (b === 0 ? EMPTY : `color-mix(in srgb, ${color} ${STEPS[b]}%, transparent)`);
  const count = (v: number) => Math.round(v * maxCount);
  const dateOf = (w: number, d: number) => (start ? addDays(start, w * 7 + d) : null);
  const future = (w: number, d: number) => {
    const date = dateOf(w, d);
    return end !== null && date !== null && date > end;
  };

  // one label per month, at its first column; the leading label yields if the
  // next month starts within two columns, so two labels never overlap
  const cols = useMemo(() => {
    const list = Array.from({ length: weeks }, (_, w) => {
      const date = start ? addDays(start, w * 7) : null;
      const m = date ? date.getMonth() : -1;
      const fresh = start !== null && date !== null && (w === 0 || addDays(start, (w - 1) * 7).getMonth() !== m);
      return { id: `w${w}`, w, m, label: fresh && date ? fmtMonth.format(date) : null };
    });
    if (list[1]?.label || list[2]?.label) list[0].label = null;
    return list;
  }, [start, weeks]);

  // one click anchors a span and dims everything else; hovering then previews
  // the run from the anchor to the pointer and totals it live, and a second
  // click locks it so the number stays on screen while the pointer moves on
  const idx = (c: Cell) => c.w * 7 + c.d;
  const clear = () => {
    setPinned(null);
    setSpanEnd(null);
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
  const select = (cell: Cell) => {
    // a locked span clears on the next click anywhere, so leaving it is one press
    if (spanEnd) {
      clear();
    } else if (pinned && idx(pinned) === idx(cell)) {
      setPinned(null);
    } else if (pinned) {
      setSpanEnd(cell);
    } else {
      setPinned(cell);
    }
  };
  /** the cell the grid reacts to: lift, ripple and label highlight follow the pointer */
  const hot = hover ?? spanEnd ?? pinned;
  /** the cell the tooltip hangs from: a locked span keeps it on its end */
  const tip = spanEnd ?? hover ?? pinned;
  const tipDate = tip ? dateOf(tip.w, tip.d) : null;
  const hotMonth = hot ? (dateOf(hot.w, hot.d)?.getMonth() ?? null) : null;
  // the tooltip is one element that glides between cells; near either edge it
  // hangs from the cell's outer corner instead of its center so it stays inside
  const align = tip ? (tip.w < 3 ? "start" : tip.w > weeks - 4 ? "end" : "center") : "center";
  const tipX = tip
    ? tip.w * PITCH + (align === "start" ? 0 : align === "end" ? CELL : CELL / 2)
    : 0;
  const tipY = tip ? MONTH_ROW + GAP + tip.d * PITCH : 0;

  return (
    <div className={cn("w-fit", className)}>
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${weeks}, ${CELL}px)`,
          gridTemplateRows: `${MONTH_ROW}px repeat(7, ${CELL}px)`,
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
            const lift = reduce ? 1 : dist === 0 ? LIFT[0] : canHover && dist < LIFT.length ? LIFT[dist] : 1;
            return (
              // the outer span owns the legend dim so it never fights the transforms inside
              <span
                key={`${id}-${dayId}`}
                className="relative block size-4 transition-opacity duration-200"
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
                  aria-pressed={isEnd}
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
                      boxShadow: isEnd
                        ? "0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)"
                        : "none",
                      transition: "box-shadow 150ms",
                    }}
                    // the diagonal wave: each cell arrives (w + d) steps after the corner;
                    // once settled, the ripple spreads out from the hovered cell by distance
                    initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                    animate={
                      settled
                        ? { opacity: 1, scale: lift, transition: { ...SPRING_PRESS, delay: Math.min(dist, 3) * 0.03 } }
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

        <AnimatePresence>
          {tip && tipDate ? (
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
                {span && span.lo !== span.hi ? (
                  <>
                    {/* the total rolls as the span stretches under the pointer */}
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <NumberTicker value={spanTotal} duration={0.35} startOnView={false} />
                      {unit}
                    </span>
                    <span className="text-muted-foreground">
                      {start ? `${fmtRange.format(addDays(start, span.lo))} – ${fmtRange.format(addDays(start, span.hi))}` : ""}
                    </span>
                    <span className="text-muted-foreground">{span.hi - span.lo + 1} days</span>
                  </>
                ) : (
                  <>
                    {/* the tooltip stays put while the pointer walks the grid; only its number rolls */}
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <NumberTicker value={count(level(tip.w, tip.d))} duration={0.35} startOnView={false} />
                      {unit}
                    </span>
                    <span className="text-muted-foreground">{fmtDay.format(tipDate)}</span>
                  </>
                )}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between gap-6">
        <span className="text-xs text-muted-foreground">
          {start && end ? `${fmtRange.format(start)} – ${fmtRange.format(end)}` : "\u00a0"}
        </span>
        {/* hovering a step keeps only cells of that level lit, so the legend doubles as a filter */}
        <span className="flex items-center gap-1" onPointerLeave={() => setStep(null)}>
          <span className="mr-0.5 text-xs text-muted-foreground">less</span>
          {STEPS.map((s, i) => (
            <span
              key={s}
              onPointerEnter={() => setStep(i)}
              className="size-3 rounded-[3px] transition-transform duration-150"
              style={{ background: fill(i), transform: step === i ? "scale(1.25)" : undefined }}
            />
          ))}
          <span className="ml-0.5 text-xs text-muted-foreground">more</span>
        </span>
      </div>
    </div>
  );
}
