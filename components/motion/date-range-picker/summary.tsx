"use client";

import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import { parse } from "./date-utils";

export type DateRangePickerSummaryProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
>;
export function DateRangePickerSummary({
  className,
  ...props
}: DateRangePickerSummaryProps) {
  const { value, shortFormat, single, t } = useDateRangePickerContext(
    "DateRangePickerSummary",
  );
  return (
    <div
      {...props}
      className={cn(
        "mb-2.5 grid items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3.5 py-2",
        !single && "grid-cols-[1fr_auto_1fr]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t(single ? "singleSummaryLabel" : "startDate")}
        </p>
        <p className="text-sm font-medium tabular-nums">
          {value ? shortFormat.format(parse(value.from)) : t("selectDate")}
        </p>
      </div>
      {!single && (
        <>
          <ArrowRight
            size={14}
            className="text-muted-foreground/60"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("endDate")}
            </p>
            <p
              className={cn(
                "text-sm font-medium tabular-nums",
                !value?.to && "text-muted-foreground",
              )}
            >
              {value?.to
                ? shortFormat.format(parse(value.to))
                : t("selectDate")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
