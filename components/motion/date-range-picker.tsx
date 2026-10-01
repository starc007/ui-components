"use client";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import {
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  MorphPopover,
  MorphPopoverContent,
  type MorphPopoverContentProps,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import {
  DateRangePickerContext,
  useDateRangePickerContext,
} from "./date-range-picker/context";
import { parse } from "./date-range-picker/date-utils";
import { useDateRangePickerController } from "./date-range-picker/use-date-range-picker";
import type {
  DateRange,
  DateRangePickerProps,
} from "./date-range-picker/types";
export type {
  DateRange,
  DateRangePreset,
  DateRangePickerProps,
} from "./date-range-picker/types";

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

/** State shared by built-in parts and custom date range controls. */
export function useDateRangePicker() {
  const ctx = useDateRangePickerContext("useDateRangePicker");
  return {
    value: ctx.value,
    setValue: ctx.change,
    open: ctx.open,
    setOpen: ctx.setOpen,
    month: ctx.month,
    view: ctx.view,
    label: ctx.label,
    locale: ctx.locale,
    disabled: ctx.disabled,
    selectDate: ctx.select,
    clear: ctx.clear,
    goToMonth: ctx.goToMonth,
    previous: () => !ctx.previousDisabled && ctx.page(-1),
    next: () => !ctx.nextDisabled && ctx.page(1),
    previousDisabled: ctx.previousDisabled,
    nextDisabled: ctx.nextDisabled,
    chooseMonth: () => ctx.openChoices("months"),
    chooseYear: () => ctx.openChoices("years"),
  };
}

/** Range state and popover root. Without children, renders the inline calendar. */
export function DateRangePicker({
  children,
  className,
  ...props
}: DateRangePickerProps) {
  const ctx = useDateRangePickerController(props);
  return (
    <DateRangePickerContext.Provider value={ctx}>
      <MorphPopover
        open={ctx.open}
        onOpenChange={ctx.setOpen}
        className={cn("max-w-full", children !== undefined && className)}
      >
        {children === undefined ? (
          <DateRangePickerCalendar className={className} />
        ) : (
          children
        )}
      </MorphPopover>
    </DateRangePickerContext.Provider>
  );
}

export interface DateRangePickerCalendarProps
  extends ComponentPropsWithoutRef<"section"> {
  showSummary?: boolean;
}

/** Calendar surface; arrange or omit its summary, header, grid and footer. */
export function DateRangePickerCalendar({
  children,
  className,
  showSummary,
  ...props
}: DateRangePickerCalendarProps) {
  const ctx = useDateRangePickerContext("DateRangePickerCalendar");
  return (
    <section
      {...props}
      aria-label={props["aria-label"] ?? ctx.label}
      className={cn(
        "w-80 max-w-full rounded-2xl border border-border bg-background p-3.5",
        className,
      )}
    >
      <h3 id={ctx.heading} aria-live="polite" className="sr-only">
        {ctx.monthFormat.format(parse(ctx.month))}
      </h3>
      {children === undefined ? (
        <>
          {(showSummary ?? ctx.showSummary) && <DateRangePickerSummary />}
          <DateRangePickerHeader />
          <DateRangePickerGrid />
          <DateRangePickerFooter />
        </>
      ) : (
        children
      )}
      <p id={ctx.help} className="sr-only">
        Use arrow keys to navigate dates, Home and End for the week, Page Up and
        Page Down for months, Shift with Page Up or Page Down for years. Enter
        or Space selects a date. Use the month and year buttons to jump
        directly. In the month or year choices, use arrow keys to move and
        Escape to return.
      </p>
      <span role="status" className="sr-only">
        {ctx.announcement}
      </span>
    </section>
  );
}

export type DateRangePickerSummaryProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
>;
export function DateRangePickerSummary({
  className,
  ...props
}: DateRangePickerSummaryProps) {
  const { value, shortFormat } = useDateRangePickerContext(
    "DateRangePickerSummary",
  );
  return (
    <div
      {...props}
      className={cn(
        "mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2",
        className,
      )}
    >
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
  );
}

export type DateRangePickerHeaderProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
>;
export function DateRangePickerHeader({
  className,
  ...props
}: DateRangePickerHeaderProps) {
  const {
    monthTrigger,
    yearTrigger,
    view,
    choicesId,
    disabled,
    openChoices,
    monthNameFormat,
    month,
    yearPage,
    yearPageEnd,
    year,
    previousDisabled,
    nextDisabled,
    page,
  } = useDateRangePickerContext("DateRangePickerHeader");
  return (
    <div
      {...props}
      className={cn("mb-2 flex items-center justify-between gap-1", className)}
    >
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
  );
}

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
  );
}

export type DateRangePickerSelectionProps = ComponentPropsWithoutRef<"p">;
export function DateRangePickerSelection({
  children,
  className,
  ...props
}: DateRangePickerSelectionProps) {
  const { value, dayCount } = useDateRangePickerContext(
    "DateRangePickerSelection",
  );
  return (
    <p {...props} className={cn("text-xs text-muted-foreground", className)}>
      {children ??
        (dayCount
          ? `${dayCount} ${dayCount === 1 ? "day" : "days"} selected`
          : value
            ? "Choose an end date"
            : "Choose a start date")}
    </p>
  );
}

export type DateRangePickerClearProps = ComponentPropsWithRef<"button">;
export function DateRangePickerClear({
  children = "Clear",
  className,
  onClick,
  disabled,
  ...props
}: DateRangePickerClearProps) {
  const ctx = useDateRangePickerContext("DateRangePickerClear");
  return (
    <button
      {...props}
      type="button"
      aria-label={props["aria-label"] ?? "Clear date range"}
      disabled={disabled || ctx.disabled || !ctx.value}
      className={cn(
        "rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.clear();
      }}
    >
      {children}
    </button>
  );
}

export type DateRangePickerFooterProps = ComponentPropsWithoutRef<"div">;
export function DateRangePickerFooter({
  children,
  className,
  ...props
}: DateRangePickerFooterProps) {
  return (
    <div
      {...props}
      className={cn("mt-2.5 border-t border-border pt-2.5", className)}
    >
      {children === undefined ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <DateRangePickerSelection />
            <DateRangePickerClear />
          </div>
          <DateRangePickerPresets />
        </>
      ) : (
        children
      )}
    </div>
  );
}

export type DateRangePickerPresetsProps = ComponentPropsWithoutRef<"div">;
export function DateRangePickerPresets({
  children,
  className,
  ...props
}: DateRangePickerPresetsProps) {
  const ctx = useDateRangePickerContext("DateRangePickerPresets");
  if (children === undefined && ctx.presets.length === 0) return null;
  return (
    <div
      {...props}
      className={cn("mt-2.5 flex flex-wrap justify-center gap-1.5", className)}
    >
      {children === undefined
        ? ctx.presets.map((preset) => (
            <DateRangePickerPreset
              key={preset.label}
              value={preset.value}
              label={preset.label}
            >
              {preset.label}
            </DateRangePickerPreset>
          ))
        : children}
    </div>
  );
}

export interface DateRangePickerPresetProps
  extends Omit<ComponentPropsWithRef<"button">, "value"> {
  value: DateRange;
  /** Accessible preset name and selection announcement. */
  label: string;
}
export function DateRangePickerPreset({
  value,
  label,
  children,
  className,
  disabled,
  onClick,
  ...props
}: DateRangePickerPresetProps) {
  const ctx = useDateRangePickerContext("DateRangePickerPreset");
  const selected = ctx.value?.from === value.from && ctx.value?.to === value.to;
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled || !ctx.rangeAvailable(value)}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        selected
          ? "bg-foreground text-background"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.selectPreset(value, label);
      }}
    >
      {children ?? label}
    </button>
  );
}

export interface DateRangePickerTriggerProps
  extends ComponentPropsWithRef<"button"> {
  placeholder?: string;
}
export function DateRangePickerTrigger({
  children,
  placeholder = "Select dates",
  className,
  disabled,
  ref,
  ...props
}: DateRangePickerTriggerProps) {
  const ctx = useDateRangePickerContext("DateRangePickerTrigger");
  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      ctx.trigger.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ctx.trigger, ref],
  );
  const format = new Intl.DateTimeFormat(ctx.locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const sameYear =
    ctx.value?.to && ctx.value.from.slice(0, 4) === ctx.value.to.slice(0, 4);
  const summary = ctx.value
    ? `${(sameYear ? format : ctx.shortFormat).format(parse(ctx.value.from))} – ${ctx.value.to ? ctx.shortFormat.format(parse(ctx.value.to)) : "Select end"}`
    : placeholder;
  return (
    <MorphPopoverTrigger>
      <button
        {...props}
        ref={mergedRef}
        type="button"
        disabled={disabled || ctx.disabled}
        aria-label={props["aria-label"] ?? `${ctx.label}: ${summary}`}
        className={cn(
          "inline-flex h-9 w-fit max-w-full items-center gap-2 rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
          className,
        )}
      >
        {children ?? (
          <>
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
                ctx.open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </MorphPopoverTrigger>
  );
}

export interface DateRangePickerContentProps extends MorphPopoverContentProps {
  /** Move focus to the active calendar date when opened. Default true. */
  autoFocus?: boolean;
}

function focusCalendarDate(content: HTMLDivElement | null) {
  const grid = Array.from(
    content?.querySelectorAll<HTMLElement>('[role="grid"]') ?? [],
  ).find((element) => !element.closest("[inert]"));
  const target =
    grid?.querySelector<HTMLElement>('button[tabindex="0"]') ?? grid;
  target?.focus({ preventScroll: true });
}

export function DateRangePickerContent({
  children,
  className,
  autoFocus = true,
  onOpenAutoFocus,
  ...props
}: DateRangePickerContentProps) {
  const ctx = useDateRangePickerContext("DateRangePickerContent");
  useLayoutEffect(() => {
    // A rapid reopen can revive the exiting surface before it unmounts.
    // That surface already ran its positioned callback, so focus it here too.
    if (ctx.open && autoFocus) focusCalendarDate(ctx.content.current);
  }, [ctx.open, ctx.content, autoFocus]);
  return (
    <MorphPopoverContent
      align="start"
      radius={16}
      shadow={false}
      {...props}
      className={cn("w-80 max-w-[calc(100vw-1.5rem)]", className)}
      onOpenAutoFocus={(content) => {
        ctx.content.current = content;
        if (autoFocus) focusCalendarDate(content);
        onOpenAutoFocus?.(content);
      }}
    >
      {children}
    </MorphPopoverContent>
  );
}

export interface DateRangePickerDropdownProps
  extends Omit<DateRangePickerProps, "children"> {
  placeholder?: string;
  triggerClassName?: string;
  calendarClassName?: string;
}
/** Convenience composition of the root, trigger, content and calendar. */
export function DateRangePickerDropdown({
  placeholder,
  triggerClassName,
  calendarClassName,
  autoFocus = true,
  showSummary = false,
  ...props
}: DateRangePickerDropdownProps) {
  return (
    <DateRangePicker {...props} autoFocus={autoFocus} showSummary={showSummary}>
      <DateRangePickerTrigger
        placeholder={placeholder}
        className={triggerClassName}
      />
      <DateRangePickerContent autoFocus={autoFocus}>
        <DateRangePickerCalendar
          className={cn("w-full rounded-none border-0", calendarClassName)}
        />
      </DateRangePickerContent>
    </DateRangePicker>
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
