"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  defaultOptionFilter,
  type OptionFilter,
  type RegisteredItem,
  useFilteredOptions,
} from "@/components/motion/combobox/use-filtered-options";
import { type DismissReason, useDismiss } from "@/lib/hooks/use-dismiss";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  type MultiSelectMessages,
  type MultiSelectTranslate,
  multiSelectMessages,
} from "./messages";

export type RegisteredMultiSelectItem = RegisteredItem;

export type MultiSelectFilter = OptionFilter;

export type MultiSelectContextValue = {
  open: boolean;
  setOpen: (open: boolean, restoreFocus?: boolean) => void;
  values: string[];
  toggle: (value: string) => void;
  remove: (value: string) => void;
  query: string;
  setQuery: (query: string) => void;
  activeValue: string | null;
  setActiveValue: (value: string | null) => void;
  moveActive: (direction: 1 | -1 | "first" | "last") => void;
  toggleActive: () => void;
  registerItem: (item: RegisteredMultiSelectItem) => void;
  unregisterItem: (value: string) => void;
  labelFor: (value: string) => string;
  isVisible: (value: string) => boolean;
  hasVisibleItems: (groupId: string) => boolean;
  visibleCount: number;
  activeItemId: string | undefined;
  triggerId: string;
  listId: string;
  inputId: string;
  disabled: boolean;
  reduce: boolean;
  triggerRef: MutableRefObject<HTMLDivElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  activeLayoutId: string;
  t: MultiSelectTranslate;
};

export const MultiSelectContext =
  createContext<MultiSelectContextValue | null>(null);
export const MultiSelectGroupContext = createContext<string | null>(null);

export function useMultiSelectContext(component: string) {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error(`${component} must be used within <MultiSelect>`);
  }
  return context;
}


export interface MultiSelectProps {
  children: ReactNode;
  /** The selected values, for controlled use. */
  value?: string[];
  /** The initial selected values when uncontrolled. Default: [] */
  defaultValue?: string[];
  /** Called with the new list of values when an option is added or removed. */
  onValueChange?: (value: string[]) => void;
  /** Whether the list is open, for controlled use. */
  open?: boolean;
  /** Whether the list starts open when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the new state when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The search text, for controlled use. */
  query?: string;
  /** The initial search text when uncontrolled. Default: "" */
  defaultQuery?: string;
  /** Called with the new text when the search input changes. */
  onQueryChange?: (query: string) => void;
  /** Decides which options match the search text. */
  filter?: MultiSelectFilter;
  /** Blocks opening and changing the selection. Default: false */
  disabled?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
  /** Override any built-in string. `{label}` fills the option label. */
  labels?: Partial<MultiSelectMessages>;
}

export function MultiSelect({
  children,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  query: controlledQuery,
  defaultQuery = "",
  onQueryChange,
  filter = defaultOptionFilter,
  disabled = false,
  className,
  labels,
}: MultiSelectProps) {
  const t = useMessages("multiSelect", multiSelectMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalQuery, setInternalQuery] = useState(defaultQuery);

  const valueControlled = controlledValue !== undefined;
  const openControlled = controlledOpen !== undefined;
  const queryControlled = controlledQuery !== undefined;
  const values = controlledValue ?? internalValue;
  const open = controlledOpen ?? internalOpen;
  const query = controlledQuery ?? internalQuery;

  const updateQuery = useCallback(
    (next: string) => {
      if (!queryControlled) setInternalQuery(next);
      onQueryChange?.(next);
    },
    [onQueryChange, queryControlled],
  );

  const updateOpen = useCallback(
    (next: boolean, restoreFocus = false) => {
      if (disabled && next) return;
      if (next !== open) {
        if (!openControlled) setInternalOpen(next);
        onOpenChange?.(next);
      }
      if (!next) updateQuery("");
      if (restoreFocus) {
        requestAnimationFrame(() =>
          inputRef.current?.focus({ preventScroll: true }),
        );
      }
    },
    [disabled, onOpenChange, open, openControlled, updateQuery],
  );

  const {
    items,
    registerItem,
    unregisterItem,
    listQuery,
    visibleValues,
    visibleGroupIds,
    visibleCount,
    activeValue,
    setActiveValue,
    moveActive,
    activeItemId,
  } = useFilteredOptions({ open, query, value: values[0], filter });

  const commitValue = useCallback(
    (next: string[]) => {
      if (!valueControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange, valueControlled],
  );

  const toggle = useCallback(
    (next: string) => {
      if (items.get(next)?.disabled) return;
      commitValue(
        values.includes(next)
          ? values.filter((value) => value !== next)
          : [...values, next],
      );
      updateQuery("");
      requestAnimationFrame(() =>
        inputRef.current?.focus({ preventScroll: true }),
      );
    },
    [commitValue, items, updateQuery, values],
  );

  const remove = useCallback(
    (itemValue: string) => {
      if (!values.includes(itemValue)) return;
      commitValue(values.filter((value) => value !== itemValue));
    },
    [commitValue, values],
  );

  const toggleActive = useCallback(() => {
    if (activeValue) toggle(activeValue);
  }, [activeValue, toggle]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const insideContent = useCallback(
    (target: Element) => Boolean(contentRef.current?.contains(target)),
    [],
  );
  const dismiss = useCallback(
    (reason: DismissReason) => updateOpen(false, reason === "escape"),
    [updateOpen],
  );
  useDismiss(open, dismiss, rootRef, { focusOutside: true, ignore: insideContent });

  const context = useMemo<MultiSelectContextValue>(
    () => ({
      open,
      setOpen: updateOpen,
      values,
      toggle,
      remove,
      query,
      setQuery: updateQuery,
      activeValue,
      setActiveValue,
      moveActive,
      toggleActive,
      registerItem,
      unregisterItem,
      labelFor: (itemValue) => items.get(itemValue)?.label ?? itemValue,
      isVisible: (itemValue) => !listQuery.trim() || visibleValues.has(itemValue),
      hasVisibleItems: (groupId) => visibleGroupIds.has(groupId),
      visibleCount,
      activeItemId,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      inputId: `${baseId}-input`,
      disabled,
      reduce,
      triggerRef,
      contentRef,
      inputRef,
      activeLayoutId: `${baseId}-active`,
      t,
    }),
    [
      activeItemId,
      activeValue,
      baseId,
      disabled,
      items,
      listQuery,
      moveActive,
      open,
      query,
      reduce,
      registerItem,
      remove,
      setActiveValue,
      t,
      toggle,
      toggleActive,
      unregisterItem,
      updateOpen,
      updateQuery,
      values,
      visibleGroupIds,
      visibleCount,
      visibleValues,
    ],
  );

  return (
    <MultiSelectContext.Provider value={context}>
      <div ref={rootRef} className={cn("relative w-full", className)}>
        {children}
      </div>
    </MultiSelectContext.Provider>
  );
}
