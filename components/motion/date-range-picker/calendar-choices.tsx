"use client";

import { motion } from "motion/react";
import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** The month or year grid that replaces the days while choosing. */
export function CalendarChoices({
  id,
  label,
  choices,
  selected,
  focusOnMount,
  reduce,
  onClose,
  onSelect,
}: {
  id: string;
  label: string;
  /** `label` is the full name; `short` is what the grid shows. */
  choices: { id: string; label: string; short: string; disabled: boolean }[];
  selected: string;
  focusOnMount: boolean;
  reduce: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const enabled = choices.filter((choice) => !choice.disabled);
  const [cursor, setCursor] = useState<string | null>(selected);
  const active =
    enabled.find((choice) => choice.id === cursor)?.id ??
    enabled.find((choice) => choice.id === selected)?.id ??
    enabled[0]?.id;
  if (cursor !== null && cursor !== active) setCursor(active ?? null);
  const root = useRef<HTMLFieldSetElement>(null);
  useLayoutEffect(() => {
    if (focusOnMount)
      root.current
        ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
        ?.focus({ preventScroll: true });
  }, [focusOnMount]);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const buttons = Array.from(
      root.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    const index = buttons.indexOf(event.currentTarget);
    const offset =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp"
            ? -3
            : event.key === "ArrowDown"
              ? 3
              : null;
    let target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : offset === null
            ? null
            : index + offset;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (target === null) return;
    event.preventDefault();
    const step =
      offset === null ? (event.key === "Home" ? 1 : -1) : Math.sign(offset);
    while (target >= 0 && target < buttons.length && buttons[target].disabled)
      target += step;
    buttons[target]?.focus({ preventScroll: true });
  };
  return (
    <fieldset
      ref={root}
      id={id}
      aria-label={label}
      className="grid min-h-[15.25rem] grid-cols-3 content-start gap-2 border-0 p-0 pt-1"
    >
      {choices.map((choice) => (
        <motion.button
          key={choice.id}
          type="button"
          disabled={choice.disabled}
          aria-label={choice.label === choice.short ? undefined : choice.label}
          aria-pressed={choice.id === selected}
          tabIndex={choice.id === active ? 0 : -1}
          onFocus={() => setCursor(choice.id)}
          onKeyDown={onKey}
          onClick={() => onSelect(choice.id)}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={SPRING_PRESS}
          // The cell stays a full-size tap target that fills the grid; only the
          // pill inside it carries the selection, hover and focus.
          className="group flex h-13 items-center justify-center text-sm tabular-nums outline-none disabled:opacity-25"
        >
          <span
            className={cn(
              "inline-flex h-9 min-w-14 items-center justify-center rounded-full px-3 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
              choice.id === selected
                ? "bg-primary font-medium text-primary-foreground"
                : "text-foreground group-hover:bg-muted group-disabled:group-hover:bg-transparent",
            )}
          >
            {choice.short}
          </span>
        </motion.button>
      ))}
    </fieldset>
  );
}
