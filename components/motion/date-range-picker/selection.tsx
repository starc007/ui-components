"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";

export type DateRangePickerSelectionProps = ComponentPropsWithoutRef<"p">;
export function DateRangePickerSelection({
  children,
  className,
  ...props
}: DateRangePickerSelectionProps) {
  const { value, dayCount, single, t } = useDateRangePickerContext(
    "DateRangePickerSelection",
  );
  if (single && children == null) return null;
  return (
    <p {...props} className={cn("text-xs text-muted-foreground", className)}>
      {children ??
        (dayCount
          ? t(dayCount === 1 ? "daySelected" : "daysSelected", {
              count: dayCount,
            })
          : value
            ? t("chooseEndDate")
            : t("chooseStartDate"))}
    </p>
  );
}
