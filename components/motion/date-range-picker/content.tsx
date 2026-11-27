"use client";

import { useLayoutEffect } from "react";
import {
  MorphPopoverContent,
  type MorphPopoverContentProps,
} from "@/components/motion/popover-morph";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";

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
      shadow={false}
      {...props}
      className={cn(
        // On phones, fade the full calendar in so the clip cannot hide controls
        // or cut their tap targets while the panel is visible.
        "w-80 max-w-[calc(100vw-1.5rem)] max-sm:[clip-path:none]!",
        className,
      )}
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
