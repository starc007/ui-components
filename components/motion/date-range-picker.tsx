"use client";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";

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
  /** Move focus to the active date on mount, for use inside a popover. */
  autoFocus?: boolean;
  /** Show the start/end summary above the calendar. Default true. */
  showSummary?: boolean;
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
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

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
  autoFocus = false,
  showSummary = true,
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
  const [requestedMonth, setMonth] = useState(() => monthOf(initial));
  const month =
    min && requestedMonth < monthOf(min)
      ? monthOf(min)
      : max && requestedMonth > monthOf(max)
        ? monthOf(max)
        : requestedMonth;
  if (requestedMonth !== month) setMonth(month);
  const [cursor, setCursor] = useState<string | null>(
    () => value?.from ?? initial,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [requestedYearPage, setYearPage] = useState(
    () => Math.floor(Number(initial.slice(0, 4)) / 12) * 12,
  );
  const [focusChoices, setFocusChoices] = useState(false);
  const monthTrigger = useRef<HTMLButtonElement>(null);
  const yearTrigger = useRef<HTMLButtonElement>(null);
  const returnToTrigger = useRef<"months" | "years" | null>(null);
  const grid = useRef<HTMLTableElement>(null);
  const pendingFocus = useRef(autoFocus);
  const heading = useId();
  const help = useId();
  const choicesId = useId();
  const reduce = useReducedMotion() ?? false;
  const canHover = useHoverCapable();
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthNameFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
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
  const lastDay = new Date(parse(month));
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1);
  lastDay.setUTCDate(0);
  const daysInMonth = lastDay.getUTCDate();
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
    if (returnToTrigger.current) {
      const target = returnToTrigger.current;
      returnToTrigger.current = null;
      (target === "months" ? monthTrigger : yearTrigger).current?.focus({
        preventScroll: true,
      });
    }
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
  // Six rows keep the surface stable while changing months or browsing years.
  while (cells.length < 42) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => ({
    start: iso(parse(month) + (index * 7 - leading) * DAY),
    dates: cells.slice(index * 7, index * 7 + 7),
  }));
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const minYear = min ? Number(min.slice(0, 4)) : 0;
  const maxYear = max ? Number(max.slice(0, 4)) : 9999;
  const firstYearPage = minYear;
  // Backfill the final page so it still has twelve years when the bounds allow it.
  const lastYearPage = Math.max(minYear, maxYear - 11);
  const yearPage = Math.min(
    lastYearPage,
    Math.max(firstYearPage, requestedYearPage),
  );
  if (requestedYearPage !== yearPage) setYearPage(yearPage);
  const yearPageEnd = Math.min(yearPage + 11, maxYear);
  const previousDisabled =
    disabled ||
    (view === "years"
      ? yearPage <= firstYearPage
      : view === "months"
        ? year <= minYear
        : (year === 0 && monthIndex === 0) ||
          Boolean(min && monthOf(shiftMonth(month, -1)) < monthOf(min)));
  const nextDisabled =
    disabled ||
    (view === "years"
      ? yearPage >= lastYearPage
      : view === "months"
        ? year >= maxYear
        : (year === 9999 && monthIndex === 11) ||
          Boolean(max && monthOf(shiftMonth(month, 1)) > monthOf(max)));
  const closeChoices = () => {
    returnToTrigger.current = view === "years" ? "years" : "months";
    setView("days");
  };
  const openChoices = (next: "months" | "years") => {
    if (view === next) {
      closeChoices();
      return;
    }
    setPreview(null);
    setFocusChoices(true);
    if (next === "years")
      setYearPage(
        Math.min(
          lastYearPage,
          Math.max(
            firstYearPage,
            minYear + Math.floor((year - minYear) / 12) * 12,
          ),
        ),
      );
    setView(next);
  };
  const goToMonth = (next: string) => {
    const clamped =
      min && next < monthOf(min)
        ? monthOf(min)
        : max && next > monthOf(max)
          ? monthOf(max)
          : next;
    setDirection(clamped >= month ? 1 : -1);
    setMonth(clamped);
    setCursor(clamped);
    setPreview(null);
    closeChoices();
  };
  const page = (step: -1 | 1) => {
    setFocusChoices(false);
    if (view === "years") {
      setDirection(step);
      const next = Math.min(
        lastYearPage,
        Math.max(firstYearPage, yearPage + step * 12),
      );
      if (next === firstYearPage || next === lastYearPage)
        returnToTrigger.current = "years";
      setYearPage((current) =>
        Math.min(lastYearPage, Math.max(firstYearPage, current + step * 12)),
      );
    } else if (view === "months") {
      const next = shiftMonth(month, step * 12);
      const clamped =
        min && next < monthOf(min)
          ? monthOf(min)
          : max && next > monthOf(max)
            ? monthOf(max)
            : monthOf(next);
      setDirection(step);
      setMonth(clamped);
      setCursor(clamped);
      if (
        Number(clamped.slice(0, 4)) === minYear ||
        Number(clamped.slice(0, 4)) === maxYear
      )
        returnToTrigger.current = "months";
    } else {
      const next = monthOf(shiftMonth(latest.current.active ?? month, step));
      if (next === (min && monthOf(min)) || next === (max && monthOf(max)))
        returnToTrigger.current = "months";
      navigate(step);
    }
  };
  const choices =
    view === "months"
      ? Array.from({ length: 12 }, (_, index) => {
          const date = `${String(year).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}-01`;
          return {
            id: date,
            label: monthNameFormat.format(parse(date)),
            disabled:
              disabled ||
              Boolean(min && date < monthOf(min)) ||
              Boolean(max && date > monthOf(max)),
          };
        })
      : Array.from(
          { length: Math.max(0, yearPageEnd - yearPage + 1) },
          (_, index) => {
            const choiceYear = yearPage + index;
            return {
              id: String(choiceYear),
              label: String(choiceYear),
              disabled:
                disabled || choiceYear < minYear || choiceYear > maxYear,
            };
          },
        );
  const dayCount = value?.to
    ? Math.round((parse(value.to) - parse(value.from)) / DAY) + 1
    : null;

  return (
    <section
      aria-label={label}
      className={cn(
        "w-full max-w-80 rounded-2xl border border-border bg-background p-3.5",
        className,
      )}
    >
      {showSummary && (
        <div className="mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Start date
            </p>
            <p className="text-[13px] font-medium tabular-nums">
              {value ? shortFormat.format(parse(value.from)) : "Select date"}
            </p>
          </div>
          <ArrowRight
            size={14}
            className="text-muted-foreground/60"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              End date
            </p>
            <p
              className={cn(
                "text-[13px] font-medium tabular-nums",
                !value?.to && "text-muted-foreground",
              )}
            >
              {value?.to ? shortFormat.format(parse(value.to)) : "Select date"}
            </p>
          </div>
        </div>
      )}
      <h3 id={heading} aria-live="polite" className="sr-only">
        {monthFormat.format(parse(month))}
      </h3>
      <div className="mb-2 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          <button
            ref={monthTrigger}
            type="button"
            aria-label="Choose month"
            aria-expanded={view === "months"}
            aria-controls={view === "months" ? choicesId : undefined}
            disabled={disabled}
            onClick={() => openChoices("months")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
              view === "years" && "hidden",
            )}
          >
            {monthNameFormat.format(parse(month))}
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={cn(
                "text-muted-foreground",
                view === "months" && "rotate-180",
              )}
            />
          </button>
          <button
            ref={yearTrigger}
            type="button"
            aria-label="Choose year"
            aria-expanded={view === "years"}
            aria-controls={view === "years" ? choicesId : undefined}
            disabled={disabled}
            onClick={() => openChoices("years")}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            {view === "years" ? `${yearPage}–${yearPageEnd}` : year}
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={cn(view === "years" && "rotate-180")}
            />
          </button>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            aria-label={
              view === "years"
                ? "Previous years"
                : view === "months"
                  ? "Previous year"
                  : "Previous month"
            }
            disabled={previousDisabled}
            className={iconClass}
            onClick={() => page(-1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={
              view === "years"
                ? "Next years"
                : view === "months"
                  ? "Next year"
                  : "Next month"
            }
            disabled={nextDisabled}
            hidden={view === "years" && nextDisabled}
            className={cn(
              iconClass,
              view === "years" && nextDisabled && "hidden",
            )}
            onClick={() => page(1)}
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
                    view === "months"
                      ? `Choose a month in ${year}`
                      : `Choose a year from ${yearPage} to ${yearPageEnd}`
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
                            className="h-6 pb-1.5 text-center text-[11px] font-medium text-muted-foreground"
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
                                  (dayIndex === 0 ||
                                    date === shownRange?.from) &&
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
                                    "pointer-events-none absolute inset-y-0 rounded-[inherit] bg-foreground/[0.08]",
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
                                      ? "bg-foreground font-medium text-background"
                                      : canHover &&
                                          !unavailable(date) &&
                                          !inRange &&
                                          "hover:bg-muted",
                                    date === today &&
                                      !endpoint &&
                                      "font-semibold after:absolute after:bottom-1 after:size-0.75 after:rounded-full after:bg-current",
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
      <div className="mt-2.5 border-t border-border pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {dayCount
              ? `${dayCount} ${dayCount === 1 ? "day" : "days"} selected`
              : value
                ? "Choose an end date"
                : "Choose a start date"}
          </p>
          <button
            type="button"
            aria-label="Clear date range"
            disabled={disabled || !value}
            className="rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
            onClick={() => {
              if (view === "days") pendingFocus.current = true;
              else returnToTrigger.current = view;
              change(null);
              setAnnouncement("Date range cleared.");
            }}
          >
            Clear
          </button>
        </div>
        {presets.length > 0 && (
          <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
            {presets.map((preset) => {
              const selected =
                value?.from === preset.value.from &&
                value?.to === preset.value.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={selected}
                  disabled={!rangeAvailable(preset.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                    selected
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => {
                    if (view !== "days") closeChoices();
                    change(preset.value);
                    setDirection(preset.value.from >= month ? 1 : -1);
                    setMonth(monthOf(preset.value.from));
                    setCursor(preset.value.from);
                    setAnnouncement(`${preset.label} selected.`);
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p id={help} className="sr-only">
        Use arrow keys to navigate dates, Home and End for the week, Page Up and
        Page Down for months, Shift with Page Up or Page Down for years. Enter
        or Space selects a date. Use the month and year buttons to jump
        directly. In the month or year choices, use arrow keys to move and
        Escape to return.
      </p>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

export interface DateRangePickerDropdownProps extends DateRangePickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  triggerClassName?: string;
  calendarClassName?: string;
}

/** A compact range trigger composed with the library's morphing popover. */
export function DateRangePickerDropdown({
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Select dates",
  label = "Choose a date range",
  locale = "en-US",
  disabled = false,
  className,
  triggerClassName,
  calendarClassName,
  autoFocus = true,
  ...calendarProps
}: DateRangePickerDropdownProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue === undefined ? internalValue : controlledValue;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen === undefined ? internalOpen : controlledOpen;
  const trigger = useRef<HTMLButtonElement>(null);
  const format = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const formatWithYear = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const sameYear = value?.to && value.from.slice(0, 4) === value.to.slice(0, 4);
  const summary = value
    ? `${(sameYear ? format : formatWithYear).format(parse(value.from))} – ${value.to ? formatWithYear.format(parse(value.to)) : "Select end"}`
    : placeholder;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  return (
    <MorphPopover
      open={open}
      onOpenChange={setOpen}
      className={cn("max-w-full", className)}
    >
      <MorphPopoverTrigger>
        <button
          ref={trigger}
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${summary}`}
          className={cn(
            "inline-flex h-9 w-fit max-w-full items-center gap-2 rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
            triggerClassName,
          )}
        >
          <CalendarDays
            size={15}
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 truncate tabular-nums">{summary}</span>
          <ChevronDown
            size={13}
            className={cn(
              "shrink-0 text-muted-foreground",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent
        align="start"
        radius={16}
        shadow={false}
        onOpenAutoFocus={(content) => {
          if (!autoFocus) return;
          const target =
            content.querySelector<HTMLElement>(
              '[role="grid"] button[tabindex="0"]',
            ) ?? content.querySelector<HTMLElement>('[role="grid"]');
          target?.focus({ preventScroll: true });
        }}
        className="w-80 max-w-[calc(100vw-1.5rem)]"
      >
        <DateRangePicker
          {...calendarProps}
          defaultMonth={calendarProps.defaultMonth ?? value?.from}
          label={label}
          locale={locale}
          disabled={disabled}
          autoFocus={autoFocus}
          showSummary={calendarProps.showSummary ?? false}
          value={value}
          onValueChange={(next) => {
            if (controlledValue === undefined) setInternalValue(next);
            onValueChange?.(next);
            if (next?.to) {
              setOpen(false);
              trigger.current?.focus({ preventScroll: true });
            }
          }}
          className={cn("max-w-none rounded-none border-0", calendarClassName)}
        />
      </MorphPopoverContent>
    </MorphPopover>
  );
}

// The departing month's grid must leave the tab order as soon as exit begins.
function CalendarPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present}>{children}</div>;
}

function CalendarChoices({
  id,
  label,
  choices,
  selected,
  focusOnMount,
  reduce,
  onClose,
  onSelect,
}: {
  id: string;
  label: string;
  choices: { id: string; label: string; disabled: boolean }[];
  selected: string;
  focusOnMount: boolean;
  reduce: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const enabled = choices.filter((choice) => !choice.disabled);
  const [cursor, setCursor] = useState<string | null>(selected);
  const active =
    enabled.find((choice) => choice.id === cursor)?.id ??
    enabled.find((choice) => choice.id === selected)?.id ??
    enabled[0]?.id;
  if (cursor !== null && cursor !== active) setCursor(active ?? null);
  const root = useRef<HTMLFieldSetElement>(null);
  useLayoutEffect(() => {
    if (focusOnMount)
      root.current
        ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
        ?.focus({ preventScroll: true });
  }, [focusOnMount]);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const buttons = Array.from(
      root.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    const index = buttons.indexOf(event.currentTarget);
    const offset =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp"
            ? -3
            : event.key === "ArrowDown"
              ? 3
              : null;
    let target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : offset === null
            ? null
            : index + offset;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (target === null) return;
    event.preventDefault();
    const step =
      offset === null ? (event.key === "Home" ? 1 : -1) : Math.sign(offset);
    while (target >= 0 && target < buttons.length && buttons[target].disabled)
      target += step;
    buttons[target]?.focus({ preventScroll: true });
  };
  return (
    <fieldset
      ref={root}
      id={id}
      aria-label={label}
      className="grid min-h-[15.25rem] grid-cols-3 content-start gap-2 border-0 p-0 pt-1"
    >
      {choices.map((choice) => (
        <motion.button
          key={choice.id}
          type="button"
          disabled={choice.disabled}
          aria-pressed={choice.id === selected}
          tabIndex={choice.id === active ? 0 : -1}
          onFocus={() => setCursor(choice.id)}
          onKeyDown={onKey}
          onClick={() => onSelect(choice.id)}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={SPRING_PRESS}
          className={cn(
            "flex h-13 items-center justify-center rounded-xl px-1 text-[13px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-25",
            choice.id === selected
              ? "bg-foreground font-medium text-background"
              : "bg-muted/40 hover:bg-muted",
          )}
        >
          {choice.label}
        </motion.button>
      ))}
    </fieldset>
  );
}
