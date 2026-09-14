"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useReturnsCalendar } from "./context";
import { COLS, DOWN, ink, MONTHS, RING, same, signed, tint, UP, YEAR } from "./utils";

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
