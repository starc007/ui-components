"use client";

import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";

export type DateRangePickerClearProps = ComponentPropsWithRef<"button">;
export function DateRangePickerClear({
  children,
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
      aria-label={props["aria-label"] ?? ctx.t("clearLabel")}
      disabled={disabled || ctx.disabled || !ctx.value}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.clear();
      }}
    >
      {children === undefined ? ctx.t("clear") : children}
    </button>
  );
}
