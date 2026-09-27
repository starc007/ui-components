"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useId, useState, type ComponentPropsWithRef } from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

type ColorSelectorContextValue = {
  value: string;
  select: (value: string) => void;
  name: string;
  disabled: boolean;
  required: boolean;
  form?: string;
};

const ColorSelectorContext = createContext<ColorSelectorContextValue | null>(null);

export interface ColorSelectorProps extends Omit<ComponentPropsWithRef<"fieldset">, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The radio group name used in form submission. Generated when omitted. */
  name?: string;
  required?: boolean;
}

/** A single color choice. Give it a ColorSelectorLabel or an aria-label. */
export function ColorSelector({
  value,
  defaultValue = "",
  onValueChange,
  name,
  disabled = false,
  required = false,
  form,
  className,
  children,
  ...props
}: ColorSelectorProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <ColorSelectorContext.Provider value={{
      value: current,
      select: (next) => {
        if (next === current) return;
        if (value === undefined) setInternal(next);
        onValueChange?.(next);
      },
      name: name ?? id,
      disabled,
      required,
      form,
    }}>
      <fieldset {...props} disabled={disabled} form={form} className={cn("min-w-0 border-0 p-0", className)}>
        <LayoutGroup id={id}>{children}</LayoutGroup>
      </fieldset>
    </ColorSelectorContext.Provider>
  );
}

export type ColorSelectorLabelProps = ComponentPropsWithRef<"legend">;

export function ColorSelectorLabel({ className, ...props }: ColorSelectorLabelProps) {
  return <legend {...props} className={cn("mb-3 p-0 text-sm font-medium text-muted-foreground", className)} />;
}

export type ColorSelectorListProps = ComponentPropsWithRef<"div">;

export function ColorSelectorList({ className, ...props }: ColorSelectorListProps) {
  return <div {...props} className={cn("flex flex-wrap items-center gap-3 p-1", className)} />;
}

export interface ColorSelectorItemProps extends Omit<ComponentPropsWithRef<"input">, "type" | "value" | "defaultValue" | "checked" | "defaultChecked" | "name" | "children" | "size"> {
  value: string;
  /** Any CSS color, including a custom property. */
  color: string;
  /** Accessible color name; selection never relies on color alone. */
  label: string;
  /** Applied to the visible swatch surface. */
  className?: string;
}

export function ColorSelectorItem({ value, color, label, disabled = false, className, style, onChange, ...props }: ColorSelectorItemProps) {
  const context = useContext(ColorSelectorContext);
  const reduce = useReducedMotion();
  if (!context) throw new Error("ColorSelectorItem must be used within ColorSelector");
  const selected = context.value === value;
  const unavailable = disabled || context.disabled;
  return (
    <motion.label
      tabIndex={-1}
      whileTap={reduce || unavailable ? undefined : { scale: 0.94 }}
      transition={SPRING_PRESS}
      className={cn("relative inline-flex shrink-0 rounded-full", unavailable ? "cursor-not-allowed opacity-40" : "cursor-pointer")}>
      <input
        {...props}
        type="radio"
        name={context.name}
        value={value}
        checked={selected}
        disabled={unavailable}
        required={context.required}
        form={context.form}
        aria-label={label}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.select(value);
        }}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        style={style}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full border border-foreground/10 bg-muted/60",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-foreground",
          className,
        )}
      >
        {selected && (
          <motion.span
            layoutId={reduce ? undefined : "color-selection"}
            initial={false}
            transition={SPRING_LAYOUT}
            className="pointer-events-none absolute -inset-1 rounded-full border-2"
            style={{ borderColor: `color-mix(in srgb, ${color} 65%, transparent)` }}
          />
        )}
        <span className="size-5 rounded-full border border-black/5" style={{ backgroundColor: color }} />
      </span>
    </motion.label>
  );
}
