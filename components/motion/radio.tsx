"use client";

import { motion, MotionConfig, useReducedMotion } from "motion/react";
import {
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

type RadioCtx = {
  value: string;
  setValue: (value: string) => void;
  layoutId: string;
  /**
   * The one option Tab reaches: the selected option, or the first enabled one
   * when nothing enabled is selected. `null` until the options have
   * registered, when every enabled option stays reachable.
   */
  tabStop: string | null;
  register: (value: string, disabled: boolean) => void;
  unregister: (value: string) => void;
};

const RadioCtx = createContext<RadioCtx | null>(null);

function useRadioGroup() {
  const ctx = useContext(RadioCtx);
  if (!ctx) {
    throw new Error("RadioGroupItem must be used inside <RadioGroup>");
  }
  return ctx;
}

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal";
  /** Accessible name for the group when no visible label names it. */
  "aria-label"?: string;
  /** Id of a visible element that names the group. */
  "aria-labelledby"?: string;
}

export function RadioGroup({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className,
  orientation = "vertical",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: RadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const layoutId = useId();
  const reduce = useReducedMotion();
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );
  const [options, setOptions] = useState<Map<string, boolean>>(new Map());
  const register = useCallback((option: string, disabled: boolean) => {
    setOptions((map) =>
      map.get(option) === disabled ? map : new Map(map).set(option, disabled),
    );
  }, []);
  const unregister = useCallback((option: string) => {
    setOptions((map) => {
      if (!map.has(option)) return map;
      const next = new Map(map);
      next.delete(option);
      return next;
    });
  }, []);
  // Resolved during render so the group has exactly one tab stop in the same
  // commit that changes the selection or the options.
  let tabStop: string | null = null;
  if (options.size > 0) {
    const enabled = Array.from(options).filter(([, disabled]) => !disabled);
    tabStop = enabled.some(([option]) => option === current)
      ? current
      : (enabled[0]?.[0] ?? "");
  }
  const contextValue = useMemo(
    () => ({ value: current, setValue, layoutId, tabStop, register, unregister }),
    [current, layoutId, setValue, tabStop, register, unregister],
  );

  return (
    <MotionConfig transition={reduce ? { duration: 0 } : SPRING_LAYOUT}>
      <RadioCtx.Provider value={contextValue}>
        <div
          role="radiogroup"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
            className,
          )}
        >
          {children}
        </div>
      </RadioCtx.Provider>
    </MotionConfig>
  );
}

export interface RadioGroupItemProps {
  value: string;
  label?: string;
  /** Supporting text under the label, announced as the description rather than the name. */
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function RadioGroupItem({
  value,
  label,
  description,
  disabled,
  className,
  id: idProp,
}: RadioGroupItemProps) {
  const {
    value: groupValue,
    setValue,
    layoutId,
    tabStop,
    register,
    unregister,
  } = useRadioGroup();
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduce = useReducedMotion();
  const selected = groupValue === value;
  const descriptionId = description ? `${id}-description` : undefined;
  // The wrapping <label> would fold the description into the name, so name from the label text alone.
  const labelId = description && label ? `${id}-label` : undefined;

  useLayoutEffect(() => {
    register(value, Boolean(disabled));
  }, [register, value, disabled]);
  useLayoutEffect(() => () => unregister(value), [unregister, value]);

  const reachable =
    !disabled && (tabStop === null ? true : tabStop === value);

  // Arrow keys move to the next enabled option in the group, wrapping at the
  // ends, and select it as focus arrives, like native radio buttons.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : 0;
    if (!step) return;
    const group = event.currentTarget.closest('[role="radiogroup"]');
    const radios = Array.from(
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    ).filter(
      (radio) =>
        !radio.disabled &&
        radio.closest('[role="radiogroup"]') === group,
    );
    const at = radios.indexOf(event.currentTarget);
    if (at < 0 || radios.length < 2) return;
    event.preventDefault();
    const next = radios[(at + step + radios.length) % radios.length];
    next.focus();
    next.click();
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex gap-3",
        description ? "items-start" : "items-center",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <motion.button
        id={id}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        disabled={disabled}
        tabIndex={reachable ? 0 : -1}
        onClick={() => !disabled && setValue(value)}
        onKeyDown={onKeyDown}
        whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
        transition={SPRING_PRESS}
        data-state={selected ? "checked" : "unchecked"}
        className={cn(
          "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 outline-none transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          selected
            ? "border-primary"
            : "border-muted-foreground/50 hover:border-muted-foreground",
        )}
      >
        {selected ? (
          <motion.span
            layoutId={layoutId}
            className="absolute inset-1 rounded-full bg-primary"
            transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
          />
        ) : null}
      </motion.button>
      {label || description ? (
        <span className={cn("flex min-w-0 flex-col gap-0.5 select-none", disabled && "opacity-60")}>
          {label ? (
            <span
              id={labelId}
              // Geist sits low in a 20px line; a 16px line lifts the text onto the control.
              className={cn("text-sm text-foreground", description && "leading-4")}
            >
              {label}
            </span>
          ) : null}
          {description ? (
            <span id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
