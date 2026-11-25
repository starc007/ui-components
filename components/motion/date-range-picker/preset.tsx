"use client";

import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import type { DateRange } from "./types";

export interface DateRangePickerPresetProps
  extends Omit<ComponentPropsWithRef<"button">, "value"> {
  /** Range selected when this preset is pressed. */
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
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        selected
          ? "bg-primary text-primary-foreground"
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
