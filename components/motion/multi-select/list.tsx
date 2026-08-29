"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import {
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  MultiSelectGroupContext,
  useMultiSelectContext,
} from "./context";

export interface MultiSelectListProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function MultiSelectList({
  children,
  ariaLabel = "Options",
  className,
}: MultiSelectListProps) {
  const context = useMultiSelectContext("MultiSelectList");
  return (
    <div
      id={context.listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable="true"
      className={cn(
        "relative isolate max-h-64 overflow-y-auto overscroll-contain p-1.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface MultiSelectGroupProps {
  children: ReactNode;
  className?: string;
}

export function MultiSelectGroup({
  children,
  className,
}: MultiSelectGroupProps) {
  const context = useMultiSelectContext("MultiSelectGroup");
  const groupId = useId();
  return (
    <MultiSelectGroupContext.Provider value={groupId}>
      <fieldset
        hidden={!context.hasVisibleItems(groupId)}
        className={cn("m-0 min-w-0 border-0 p-0 py-0.5", className)}
      >
        {children}
      </fieldset>
    </MultiSelectGroupContext.Provider>
  );
}

export interface MultiSelectLabelProps {
  children: ReactNode;
  className?: string;
}

export function MultiSelectLabel({
  children,
  className,
}: MultiSelectLabelProps) {
  const groupId = useContext(MultiSelectGroupContext);
  const labelClassName = cn(
    "w-full px-2 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground",
    className,
  );
  return groupId ? (
    <legend className={labelClassName}>{children}</legend>
  ) : (
    <div className={labelClassName}>{children}</div>
  );
}

export interface MultiSelectItemProps {
  value: string;
  children: ReactNode;
  textValue?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
}

export function MultiSelectItem({
  value,
  children,
  textValue,
  keywords = [],
  disabled = false,
  onSelect,
  className,
}: MultiSelectItemProps) {
  const context = useMultiSelectContext("MultiSelectItem");
  const groupId = useContext(MultiSelectGroupContext);
  const id = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const label = textValue ?? (typeof children === "string" ? children : value);
  const visible = context.isVisible(value);
  const active = context.activeValue === value;
  const selected = context.values.includes(value);
  const keywordKey = keywords.join("\u0000");
  const normalizedKeywords = useMemo(
    () => (keywordKey ? keywordKey.split("\u0000") : []),
    [keywordKey],
  );
  const { registerItem, unregisterItem } = context;

  useLayoutEffect(() => {
    registerItem({
      value,
      label,
      keywords: normalizedKeywords,
      disabled,
      groupId,
      id,
      ref: itemRef,
    });
    return () => unregisterItem(value);
  }, [
    disabled,
    groupId,
    id,
    label,
    normalizedKeywords,
    registerItem,
    unregisterItem,
    value,
  ]);

  if (!visible) return null;

  return (
    <button
      ref={itemRef}
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      tabIndex={-1}
      data-multi-select-item=""
      data-active={active || undefined}
      data-selected={selected || undefined}
      onPointerMove={() => {
        if (!disabled) context.setActiveValue(value);
      }}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => {
        if (disabled) return;
        onSelect?.(value);
        context.toggle(value);
      }}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors duration-150",
        active || selected ? "text-foreground" : "text-muted-foreground",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
    >
      {active ? (
        <motion.span
          aria-hidden="true"
          layoutId={context.activeLayoutId}
          className="absolute inset-0 -z-10 rounded-lg bg-muted"
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
        />
      ) : null}
      <span className="min-w-0 flex-1">{children}</span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.82)",
        }}
        transition={
          context.reduce ? { duration: 0 } : { duration: 0.14, ease: EASE_OUT }
        }
        className="grid size-5 shrink-0 place-items-center text-foreground"
      >
        <Check className="size-4" />
      </motion.span>
    </button>
  );
}

export interface MultiSelectEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function MultiSelectEmpty({
  children = "No options found.",
  className,
}: MultiSelectEmptyProps) {
  const context = useMultiSelectContext("MultiSelectEmpty");
  if (context.visibleCount > 0) return null;
  return (
    <div
      role="status"
      className={cn(
        "px-3 py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface MultiSelectSeparatorProps {
  className?: string;
}

export function MultiSelectSeparator({
  className,
}: MultiSelectSeparatorProps) {
  return (
    <div aria-hidden="true" className={cn("-mx-1 my-1 h-px bg-border", className)} />
  );
}
