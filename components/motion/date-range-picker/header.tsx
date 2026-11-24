"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import { parse } from "./date-utils";

const iconClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

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
    t,
  } = useDateRangePickerContext("DateRangePickerHeader");
  const previousLabel = t(
    view === "years" ? "previousYears" : view === "months" ? "previousYear" : "previousMonth",
  );
  const nextLabel = t(view === "years" ? "nextYears" : view === "months" ? "nextYear" : "nextMonth");
  return (
    <div
      {...props}
      className={cn("mb-2 flex items-center justify-between gap-1", className)}
    >
      <div className="flex min-w-0 items-center gap-0.5">
        <button
          ref={monthTrigger}
          type="button"
          aria-label={t("chooseMonth")}
          aria-expanded={view === "months"}
          aria-controls={view === "months" ? choicesId : undefined}
          disabled={disabled}
          onClick={() => openChoices("months")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
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
          aria-label={t("chooseYear")}
          aria-expanded={view === "years"}
          aria-controls={view === "years" ? choicesId : undefined}
          disabled={disabled}
          onClick={() => openChoices("years")}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
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
        <Tooltip content={previousLabel} side="top">
          <button
            type="button"
            aria-label={previousLabel}
            disabled={previousDisabled}
            className={iconClass}
            onClick={() => page(-1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </Tooltip>
        <Tooltip content={nextLabel} side="top">
          <button
            type="button"
            aria-label={nextLabel}
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
        </Tooltip>
      </div>
    </div>
  );
}
