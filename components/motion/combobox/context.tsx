"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { useActiveOption } from "./use-active-option";

export type RegisteredItem = {
  value: string;
  label: string;
  keywords: string[];
  disabled: boolean;
  groupId: string | null;
  id: string;
  ref: MutableRefObject<HTMLButtonElement | null>;
};

export type ComboboxFilter = (
  value: string,
  query: string,
  keywords: string[],
) => boolean;

const defaultFilter: ComboboxFilter = (value, query, keywords) => {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;

  const haystack = [value, ...keywords].join(" ").toLocaleLowerCase();
  let queryIndex = 0;
  for (const character of haystack) {
    if (character === needle[queryIndex]) queryIndex += 1;
    if (queryIndex === needle.length) return true;
  }
  return false;
};

export type ComboboxContextValue = {
  open: boolean;
  setOpen: (open: boolean, restoreFocus?: boolean) => void;
  value: string | undefined;
  select: (value: string) => void;
  query: string;
  setQuery: (query: string) => void;
  /** The option the list is currently pointing at, resolved during render. */
  activeValue: string | null;
  /**
   * Records where the pointer or keyboard moved to. The recorded value is
   * dropped when the query or the result set changes, so it does not always
   * survive to the next `activeValue`.
   */
  setActiveValue: (value: string | null) => void;
  moveActive: (direction: 1 | -1 | "first" | "last") => void;
  selectActive: () => void;
  registerItem: (item: RegisteredItem) => void;
  unregisterItem: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
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
};

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);
export const ComboboxGroupContext = createContext<string | null>(null);

export function useComboboxContext(component: string) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`${component} must be used within <Combobox>`);
  return context;
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object")
        (ref as MutableRefObject<T | null>).current = node;
    }
  };
}

export interface ComboboxProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filter?: ComboboxFilter;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  query: controlledQuery,
  defaultQuery = "",
  onQueryChange,
  filter = defaultFilter,
  disabled = false,
  className,
}: ComboboxProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [items, setItems] = useState<Map<string, RegisteredItem>>(new Map());

  const valueControlled = controlledValue !== undefined;
  const openControlled = controlledOpen !== undefined;
  const queryControlled = controlledQuery !== undefined;
  const value = valueControlled ? controlledValue : internalValue;
  const open = openControlled ? controlledOpen : internalOpen;
  const query = queryControlled ? controlledQuery : internalQuery;

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
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) updateQuery("");
      if (restoreFocus)
        requestAnimationFrame(() =>
          inputRef.current?.focus({ preventScroll: true }),
        );
    },
    [disabled, onOpenChange, openControlled, updateQuery],
  );

  const registerItem = useCallback((item: RegisteredItem) => {
    setItems((current) => {
      const existing = current.get(item.value);
      if (
        existing?.label === item.label &&
        existing.disabled === item.disabled &&
        existing.id === item.id &&
        existing.ref === item.ref &&
        existing.groupId === item.groupId &&
        existing.keywords.join("\u0000") === item.keywords.join("\u0000")
      ) {
        return current;
      }
      const next = new Map(current);
      next.set(item.value, item);
      return next;
    });
  }, []);

  const unregisterItem = useCallback((itemValue: string) => {
    setItems((current) => {
      if (!current.has(itemValue)) return current;
      const next = new Map(current);
      next.delete(itemValue);
      return next;
    });
  }, []);

  // The query the list filters by. Closing clears `query`, but the panel is
  // still on screen for its exit, so it keeps filtering by the query it was
  // open with rather than repopulating mid-collapse. The input already reads
  // `query` only while open, so nothing the user can see reads the other one.
  const [openQuery, setOpenQuery] = useState(query);
  if (open && openQuery !== query) setOpenQuery(query);
  const listQuery = open ? query : openQuery;

  const visibleItems = useMemo(
    () =>
      Array.from(items.values()).filter((item) =>
        filter(item.value, listQuery, [item.label, ...item.keywords]),
      ),
    [filter, items, listQuery],
  );
  const enabledVisibleItems = useMemo(
    () => visibleItems.filter((item) => !item.disabled),
    [visibleItems],
  );
  const visibleValues = useMemo(
    () => new Set(visibleItems.map((item) => item.value)),
    [visibleItems],
  );
  const visibleGroupIds = useMemo(
    () => new Set(visibleItems.map((item) => item.groupId)),
    [visibleItems],
  );

  const { activeValue, setActiveValue, moveActive } = useActiveOption({
    open,
    query: listQuery,
    value,
    enabledItems: enabledVisibleItems,
  });

  const select = useCallback(
    (next: string) => {
      if (items.get(next)?.disabled) return;
      if (!valueControlled) setInternalValue(next);
      onValueChange?.(next);
      updateOpen(false, true);
    },
    [items, onValueChange, updateOpen, valueControlled],
  );

  const selectActive = useCallback(() => {
    if (activeValue) select(activeValue);
  }, [activeValue, select]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!activeValue || !open) return;
    const item = items.get(activeValue)?.ref.current;
    const list = item?.closest<HTMLElement>("[role='listbox']");
    if (!item || !list) return;
    const itemRect = item.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
    else if (itemRect.bottom > listRect.bottom)
      list.scrollTop += itemRect.bottom - listRect.bottom;
  }, [activeValue, items, open]);

  useEffect(() => {
    if (!open) return;
    const isInside = (target: Node) =>
      rootRef.current?.contains(target) || contentRef.current?.contains(target);
    const onPointerDown = (event: PointerEvent) => {
      if (!isInside(event.target as Node)) updateOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!isInside(event.target as Node)) updateOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      updateOpen(false, true);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updateOpen]);

  const activeItem = activeValue ? items.get(activeValue) : undefined;
  const context = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen: updateOpen,
      value,
      select,
      query,
      setQuery: updateQuery,
      activeValue,
      setActiveValue,
      moveActive,
      selectActive,
      registerItem,
      unregisterItem,
      labelFor: (itemValue) =>
        itemValue === undefined ? undefined : items.get(itemValue)?.label,
      isVisible: (itemValue) => !listQuery.trim() || visibleValues.has(itemValue),
      hasVisibleItems: (groupId) => visibleGroupIds.has(groupId),
      visibleCount: visibleItems.length,
      activeItemId: activeItem?.id,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      inputId: `${baseId}-input`,
      disabled,
      reduce,
      triggerRef,
      contentRef,
      inputRef,
      activeLayoutId: `${baseId}-active`,
    }),
    [
      activeItem?.id,
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
      select,
      selectActive,
      setActiveValue,
      unregisterItem,
      updateOpen,
      updateQuery,
      value,
      visibleItems.length,
      visibleGroupIds,
      visibleValues,
    ],
  );

  return (
    <ComboboxContext.Provider value={context}>
      <div ref={rootRef} className={cn("relative w-full", className)}>
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}
