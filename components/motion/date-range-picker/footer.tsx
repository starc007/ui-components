"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { DateRangePickerClear } from "./clear";
import { DateRangePickerPresets } from "./presets";
import { DateRangePickerSelection } from "./selection";

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
            <DateRangePickerClear className="ms-auto" />
          </div>
          <DateRangePickerPresets />
        </>
      ) : (
        children
      )}
    </div>
  );
}
