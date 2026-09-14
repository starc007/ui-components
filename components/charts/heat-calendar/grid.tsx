"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useHeatCalendar } from "./context";
import { DAYS, fmtDay, GAP, LIFT, MONTH_ROW, PITCH } from "./utils";

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
