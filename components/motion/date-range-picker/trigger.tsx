"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { type HTMLMotionProps, motion } from "motion/react";
import { useCallback } from "react";
import { MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useDateRangePickerContext } from "./context";
import { parse } from "./date-utils";
import { dateFormats } from "./formats";

export interface DateRangePickerTriggerProps
  extends HTMLMotionProps<"button"> {
  placeholder?: string;
}
export function DateRangePickerTrigger({
  children,
  placeholder: placeholderProp,
  className,
  disabled,
  ref,
  ...props
}: DateRangePickerTriggerProps) {
  const ctx = useDateRangePickerContext("DateRangePickerTrigger");
  const placeholder = placeholderProp ?? ctx.t("placeholder");
  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      ctx.trigger.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ctx.trigger, ref],
  );
  const format = dateFormats(ctx.locale).shortNoYear;
  const sameYear =
    ctx.value?.to && ctx.value.from.slice(0, 4) === ctx.value.to.slice(0, 4);
  const summary = ctx.value
    ? `${(sameYear ? format : ctx.shortFormat).format(parse(ctx.value.from))} – ${ctx.value.to ? ctx.shortFormat.format(parse(ctx.value.to)) : ctx.t("selectEnd")}`
    : placeholder;
  return (
    <MorphPopoverTrigger>
      <motion.button
        {...props}
        ref={mergedRef}
        layout={!ctx.reduce}
        transition={{ layout: SPRING_LAYOUT }}
        style={{ borderRadius: 12, ...props.style }}
        type="button"
        disabled={disabled || ctx.disabled}
        aria-label={
          props["aria-label"] ?? ctx.t("triggerLabel", { label: ctx.label, summary })
        }
        className={cn(
          "inline-flex h-10 w-fit max-w-full items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
          className,
        )}
      >
        {children != null ? (
          <motion.span
            layout={ctx.reduce ? false : "position"}
            transition={{ layout: SPRING_LAYOUT }}
            className="inline-flex min-w-0 items-center gap-2"
          >
            {children}
          </motion.span>
        ) : (
          <>
            <motion.span
              layout={ctx.reduce ? false : "position"}
              transition={{ layout: SPRING_LAYOUT }}
              className="shrink-0 text-muted-foreground"
              aria-hidden="true"
            >
              <CalendarDays size={15} />
            </motion.span>
            <motion.span
              layout={ctx.reduce ? false : "position"}
              transition={{ layout: SPRING_LAYOUT }}
              className="min-w-0 truncate tabular-nums"
            >
              {summary}
            </motion.span>
            <motion.span
              layout={ctx.reduce ? false : "position"}
              transition={{ layout: SPRING_LAYOUT }}
              className="shrink-0 text-muted-foreground"
              aria-hidden="true"
            >
              <ChevronDown size={13} className={cn(ctx.open && "rotate-180")} />
            </motion.span>
          </>
        )}
      </motion.button>
    </MorphPopoverTrigger>
  );
}
