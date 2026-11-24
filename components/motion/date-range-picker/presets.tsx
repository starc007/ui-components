"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import { DateRangePickerPreset } from "./preset";

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
