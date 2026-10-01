"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** Calendar dates, independent of a browser's timezone: YYYY-MM-DD. */
export interface DateRange {
  from: string;
  to?: string;
}
export interface DateRangePreset {
  label: string;
  value: DateRange;
}
export interface DateRangePickerProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange | null) => void;
  defaultMonth?: string;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  presets?: DateRangePreset[];
  locale?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DAY = 86_400_000;
function parse(date: string) {
  const time = Date.parse(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(time) ||
    new Date(time).toISOString().slice(0, 10) !== date
  )
    throw new Error(`Invalid calendar date: ${date}. Use YYYY-MM-DD.`);
  return time;
}
function iso(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}
function monthOf(date: string) {
  return `${date.slice(0, 7)}-01`;
}
function shiftMonth(date: string, offset: number) {
  const day = new Date(parse(date));
  const month = new Date(parse(monthOf(date)));
  month.setUTCMonth(month.getUTCMonth() + offset);
  const end = new Date(month);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  month.setUTCDate(Math.min(day.getUTCDate(), end.getUTCDate()));
  return iso(month.getTime());
}
function ordered(a: string, b: string): Required<DateRange> {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

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

const iconClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30";

/** A standalone calendar that also composes inside the library's popovers. */
export function DateRangePicker({
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  defaultMonth,
  min,
  max,
  isDateDisabled,
  presets = [],
  locale = "en-US",
  label = "Choose a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [today] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue === undefined ? internalValue : controlledValue;
  if (min) parse(min);
  if (max) parse(max);
  if (min && max && min > max)
    throw new Error("DateRangePicker min must not exceed max.");
  if (defaultMonth) parse(defaultMonth);
  if (value) {
    parse(value.from);
    if (value.to) {
      parse(value.to);
      if (value.to < value.from)
        throw new Error("DateRangePicker range must be ordered.");
    }
  }
  const initial =
    defaultMonth ??
    value?.from ??
    (min && today < min ? min : max && today > max ? max : today);
  const [month, setMonth] = useState(() => monthOf(initial));
  const [cursor, setCursor] = useState<string | null>(
    () => value?.from ?? initial,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const grid = useRef<HTMLTableElement>(null);
  const pendingFocus = useRef(false);
  const heading = useId();
  const help = useId();
  const reduce = useReducedMotion() ?? false;
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const shortFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const unavailable = (date: string) =>
    disabled ||
    Boolean(min && date < min) ||
    Boolean(max && date > max) ||
    Boolean(isDateDisabled?.(date));
  const rangeAvailable = (range: DateRange) => {
    const first = parse(range.from);
    const last = parse(range.to ?? range.from);
    if (
      last < first ||
      unavailable(range.from) ||
      unavailable(range.to ?? range.from)
    )
      return false;
    // Only scan interiors when the consumer supplies unavailable dates.
    if (isDateDisabled)
      for (let time = first + DAY; time < last; time += DAY)
        if (unavailable(iso(time))) return false;
    return true;
  };
  const daysInMonth = new Date(parse(shiftMonth(month, 1)) - DAY).getUTCDate();
  const dates = Array.from({ length: daysInMonth }, (_, index) =>
    iso(parse(month) + index * DAY),
  );
  const active =
    cursor && dates.includes(cursor) && !unavailable(cursor)
      ? cursor
      : (dates.find((date) => !unavailable(date)) ?? null);
  if (cursor !== null && cursor !== active) setCursor(active);
  const shownRange =
    value &&
    !value.to &&
    preview &&
    rangeAvailable(ordered(value.from, preview))
      ? ordered(value.from, preview)
      : value;
  const latest = useRef({ month, active });
  useLayoutEffect(() => {
    latest.current = { month, active };
  });
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const button = grid.current?.querySelector<HTMLButtonElement>(
      'button[tabindex="0"]',
    );
    (button ?? grid.current)?.focus({ preventScroll: true });
  });

  const change = (next: DateRange | null) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
    setPreview(null);
  };
  const select = (date: string) => {
    if (unavailable(date)) return;
    setCursor(date);
    if (!value || value.to) {
      change({ from: date });
      setAnnouncement(
        `Start date ${dateFormat.format(parse(date))}. Choose an end date.`,
      );
    } else {
      const next = ordered(value.from, date);
      if (!rangeAvailable(next)) {
        setAnnouncement(
          "This range includes unavailable dates. Choose another end date.",
        );
        return;
      }
      change(next);
      setAnnouncement(
        `${shortFormat.format(parse(next.from))} to ${shortFormat.format(parse(next.to))} selected.`,
      );
    }
  };
  const navigate = (
    offset: number,
    focus = false,
    target = latest.current.active ?? latest.current.month,
  ) => {
    const next = shiftMonth(target, offset);
    if (
      (min && monthOf(next) < monthOf(min)) ||
      (max && monthOf(next) > monthOf(max))
    )
      return;
    latest.current = { month: monthOf(next), active: next };
    setDirection(offset > 0 ? 1 : -1);
    setMonth(monthOf(next));
    setCursor(next);
    setPreview(null);
    pendingFocus.current = focus;
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      navigate(
        (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1),
        true,
        date,
      );
      return;
    }
    const base = latest.current.active ?? date;
    const weekday = new Date(parse(base)).getUTCDay();
    const offset =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp"
            ? -7
            : event.key === "ArrowDown"
              ? 7
              : event.key === "Home"
                ? -weekday
                : event.key === "End"
                  ? 6 - weekday
                  : null;
    if (offset === null) return;
    event.preventDefault();
    let next = iso(parse(base) + offset * DAY);
    // Arrow navigation skips unavailable dates; Home/End stay within their week.
    if (event.key !== "Home" && event.key !== "End") {
      const step = offset < 0 ? -1 : 1;
      for (let attempts = 0; unavailable(next) && attempts < 366; attempts++) {
        if ((min && next < min) || (max && next > max)) return;
        next = iso(parse(next) + step * DAY);
      }
    }
    if (unavailable(next)) return;
    const nextMonth = monthOf(next);
    setDirection(nextMonth >= latest.current.month ? 1 : -1);
    // Own event updates are visible to a second key in the same batch.
    latest.current = { month: nextMonth, active: next };
    pendingFocus.current = true;
    setMonth(nextMonth);
    setCursor(next);
    setPreview(value && !value.to ? next : null);
  };
  const leading = new Date(parse(month)).getUTCDay();
  const cells: (string | null)[] = [
    ...Array<string | null>(leading).fill(null),
    ...dates,
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
  const previousDisabled =
    disabled ||
    Boolean(min && shiftMonth(month, -1).slice(0, 7) < min.slice(0, 7));
  const nextDisabled =
    disabled ||
    Boolean(max && shiftMonth(month, 1).slice(0, 7) > max.slice(0, 7));

  return (
    <section
      aria-label={label}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-background p-5",
        className,
      )}
    >
      {presets.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={!rangeAvailable(preset.value)}
              className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              onClick={() => {
                change(preset.value);
                setDirection(preset.value.from >= month ? 1 : -1);
                setMonth(monthOf(preset.value.from));
                setCursor(preset.value.from);
                setAnnouncement(`${preset.label} selected.`);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 id={heading} aria-live="polite" className="text-sm font-medium">
          {monthFormat.format(parse(month))}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={previousDisabled}
            className={iconClass}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={nextDisabled}
            className={iconClass}
            onClick={() => navigate(1)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden" onPointerLeave={() => setPreview(null)}>
        <AnimatePresence
          initial={false}
          mode="popLayout"
          custom={{ direction, reduce }}
        >
          <motion.div
            key={month}
            custom={{ direction, reduce }}
            variants={monthVariants}
            initial="enter"
            animate={{ opacity: 1, x: 0 }}
            exit="exit"
            transition={{ duration: reduce ? 0.1 : 0.18, ease: EASE_OUT }}
          >
            <CalendarPresence>
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
                className="w-full table-fixed border-separate border-spacing-y-1"
              >
                <thead>
                  <tr>
                    {Array.from({ length: 7 }, (_, index) => {
                      const day = new Intl.DateTimeFormat(locale, {
                        weekday: "long",
                        timeZone: "UTC",
                      }).format(Date.UTC(2026, 0, 4 + index));
                      return (
                        <th
                          key={day}
                          scope="col"
                          abbr={day}
                          className="pb-2 text-center text-[11px] font-normal text-muted-foreground"
                        >
                          {new Intl.DateTimeFormat(locale, {
                            weekday: "short",
                            timeZone: "UTC",
                          }).format(Date.UTC(2026, 0, 4 + index))}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => (
                    <tr key={week.find((date) => date !== null)}>
                      {week.map((date, dayIndex) => {
                        const inRange = Boolean(
                          date &&
                            shownRange &&
                            date >= shownRange.from &&
                            date <= (shownRange.to ?? shownRange.from),
                        );
                        const endpoint = Boolean(
                          date &&
                            shownRange &&
                            (date === shownRange.from ||
                              date === shownRange.to),
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
                            className={cn(
                              "relative p-0 text-center",
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
                              <motion.span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-foreground/[0.06]"
                                initial={false}
                                animate={{ opacity: inRange ? 1 : 0 }}
                                transition={{ duration: 0.12, ease: EASE_OUT }}
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
                                onPointerEnter={(event) => {
                                  if (
                                    event.pointerType !== "touch" &&
                                    value &&
                                    !value.to
                                  )
                                    setPreview(date);
                                }}
                                onKeyDown={(event) => onKey(event, date)}
                                className={cn(
                                  "relative mx-auto flex h-9 w-full max-w-9 items-center justify-center rounded-full text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-25",
                                  endpoint
                                    ? "bg-foreground text-background"
                                    : "hover:bg-muted",
                                  date === today &&
                                    !endpoint &&
                                    "font-semibold underline underline-offset-4",
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
            </CalendarPresence>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex min-h-10 items-center justify-between gap-2 border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          {value
            ? `${shortFormat.format(parse(value.from))}${value.to ? ` – ${shortFormat.format(parse(value.to))}` : " – Choose end date"}`
            : "Select a start and end date"}
        </span>
        <button
          type="button"
          aria-label="Clear date range"
          disabled={disabled || !value}
          className={iconClass}
          onClick={() => {
            pendingFocus.current = true;
            change(null);
            setAnnouncement("Date range cleared.");
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      <p id={help} className="sr-only">
        Use arrow keys to navigate dates, Home and End for the week, Page Up and
        Page Down for months, Shift with Page Up or Page Down for years. Enter
        or Space selects a date.
      </p>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

// The departing month's grid must leave the tab order as soon as exit begins.
function CalendarPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present}>{children}</div>;
}
