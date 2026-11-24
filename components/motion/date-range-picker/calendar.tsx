"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import { parse } from "./date-utils";
import { DateRangePickerFooter } from "./footer";
import { DateRangePickerGrid } from "./grid";
import { DateRangePickerHeader } from "./header";
import { DateRangePickerSummary } from "./summary";

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
        {ctx.t("help")}
      </p>
      <span role="status" className="sr-only">
        {ctx.announcement}
      </span>
    </section>
  );
}
