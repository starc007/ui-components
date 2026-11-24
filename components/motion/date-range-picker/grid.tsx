"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { CalendarChoices } from "./calendar-choices";
import { CalendarPresence } from "./calendar-presence";
import { useDateRangePickerContext } from "./context";
import { parse } from "./date-utils";
import { dateFormats } from "./formats";

const monthVariants = {
  enter: ({ direction, reduce }: { direction: number; reduce: boolean }) => ({
    opacity: 0,
    x: reduce ? 0 : direction * 12,
  }),
  exit: ({ direction, reduce }: { direction: number; reduce: boolean }) => ({
    opacity: 0,
    x: reduce ? 0 : direction * -8,
    transition: { duration: 0.12, ease: EASE_OUT },
  }),
};

export type DateRangePickerGridProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
>;
export function DateRangePickerGrid({
  className,
  onPointerLeave,
  ...props
}: DateRangePickerGridProps) {
  const {
    setPreview,
    view,
    month,
    yearPage,
    yearPageEnd,
    year,
    direction,
    reduce,
    choicesId,
    choices,
    focusChoices,
    closeChoices,
    goToMonth,
    grid,
    heading,
    help,
    active,
    locale,
    weeks,
    shownRange,
    value,
    canHover,
    unavailable,
    dateFormat,
    today,
    select,
    setCursor,
    onKey,
    t,
  } = useDateRangePickerContext("DateRangePickerGrid");
  return (
    <div
      {...props}
      className={cn("overflow-hidden", className)}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setPreview(null);
      }}
    >
      <AnimatePresence
        initial={false}
        mode="popLayout"
        custom={{ direction, reduce }}
      >
        <motion.div
          key={
            view === "days"
              ? month
              : `${view}-${view === "years" ? yearPage : year}`
          }
          custom={{ direction, reduce }}
          variants={monthVariants}
          initial="enter"
          animate={{ opacity: 1, x: 0 }}
          exit="exit"
          transition={{ duration: reduce ? 0.1 : 0.18, ease: EASE_OUT }}
        >
          <CalendarPresence>
            {view !== "days" ? (
              <CalendarChoices
                id={choicesId}
                label={
                  // Years as strings, so a locale never groups them ("2,026").
                  view === "months"
                    ? t("monthChoices", { year: String(year) })
                    : t("yearChoices", {
                        start: String(yearPage),
                        end: String(yearPageEnd),
                      })
                }
                choices={choices}
                selected={view === "months" ? month : String(year)}
                focusOnMount={focusChoices}
                reduce={reduce}
                onClose={closeChoices}
                onSelect={(id) =>
                  goToMonth(
                    view === "months"
                      ? id
                      : `${id.padStart(4, "0")}-${month.slice(5, 7)}-01`,
                  )
                }
              />
            ) : (
              <table
                ref={(node) => {
                  if (node) {
                    grid.current = node;
                    return () => {
                      if (grid.current === node) grid.current = null;
                    };
                  }
                }}
                // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI calendar grids retain native table structure with an interactive grid role.
                role="grid"
                aria-labelledby={heading}
                aria-describedby={help}
                tabIndex={active === null ? 0 : undefined}
                className="w-full table-fixed select-none border-separate border-spacing-x-0 border-spacing-y-1"
              >
                <thead>
                  <tr>
                    {dateFormats(locale).weekdays.map((day) => (
                      <th
                        key={day.long}
                        scope="col"
                        abbr={day.long}
                        className="h-6 pb-1.5 text-center text-[11px] font-medium text-muted-foreground"
                      >
                        {day.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map(({ start, dates: week }) => (
                    <tr key={start}>
                      {week.map((date, dayIndex) => {
                        const inRange = Boolean(
                          date &&
                            shownRange &&
                            date >= shownRange.from &&
                            date <= (shownRange.to ?? shownRange.from),
                        );
                        const endpoint = Boolean(
                          date &&
                            value &&
                            (date === value.from || date === value.to),
                        );
                        return (
                          // biome-ignore lint/a11y/useFocusableInteractive: Calendar cells delegate focus to the contained day button.
                          <td
                            // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Gridcell selection semantics belong on the native table cell.
                            role="gridcell"
                            key={date ?? `empty-${dayIndex}`}
                            aria-selected={
                              date
                                ? Boolean(
                                    value &&
                                      date >= value.from &&
                                      date <= (value.to ?? value.from),
                                  )
                                : undefined
                            }
                            onPointerEnter={(event) => {
                              if (
                                canHover &&
                                event.pointerType !== "touch" &&
                                date &&
                                !unavailable(date) &&
                                value &&
                                !value.to
                              )
                                setPreview(date);
                            }}
                            className={cn(
                              "relative h-8 p-0 text-center",
                              inRange &&
                                (dayIndex === 0 || date === shownRange?.from) &&
                                "rounded-l-full",
                              inRange &&
                                (dayIndex === 6 ||
                                  date === shownRange?.to ||
                                  !shownRange?.to) &&
                                "rounded-r-full",
                            )}
                          >
                            {date && (
                              <span
                                aria-hidden="true"
                                // Range scrubbing follows immediately: independent cell
                                // fades leave stale highlights behind a moving pointer.
                                className={cn(
                                  "pointer-events-none absolute inset-y-0 rounded-[inherit] bg-primary/10",
                                  inRange ? "opacity-100" : "opacity-0",
                                )}
                                style={{
                                  left:
                                    endpoint &&
                                    (date === shownRange?.from ||
                                      !week[dayIndex - 1])
                                      ? "50%"
                                      : 0,
                                  right:
                                    endpoint &&
                                    (date ===
                                      (shownRange?.to ?? shownRange?.from) ||
                                      !week[dayIndex + 1])
                                      ? "50%"
                                      : 0,
                                }}
                              />
                            )}
                            {date && (
                              <motion.button
                                type="button"
                                disabled={unavailable(date)}
                                aria-label={dateFormat.format(parse(date))}
                                aria-current={
                                  date === today ? "date" : undefined
                                }
                                tabIndex={date === active ? 0 : -1}
                                whileTap={reduce ? undefined : { scale: 0.9 }}
                                transition={SPRING_PRESS}
                                onClick={() => select(date)}
                                onFocus={() => {
                                  setCursor(date);
                                  if (value && !value.to) setPreview(date);
                                }}
                                onKeyDown={(event) => onKey(event, date)}
                                className={cn(
                                  "relative mx-auto flex h-8 w-full max-w-8 items-center justify-center rounded-full text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30",
                                  endpoint
                                    ? "bg-primary font-medium text-primary-foreground"
                                    : canHover &&
                                        !unavailable(date) &&
                                        !inRange &&
                                        "hover:bg-muted",
                                  date === today &&
                                    !endpoint &&
                                    "font-medium after:absolute after:bottom-1 after:size-0.75 after:rounded-full after:bg-current",
                                )}
                              >
                                {new Date(parse(date)).getUTCDate()}
                              </motion.button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CalendarPresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
