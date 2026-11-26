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
import { type DismissReason, useDismiss } from "@/lib/hooks/use-dismiss";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { selectSound } from "@/lib/sounds/select";
import { cn } from "@/lib/utils";
import {
  type ComboboxMessages,
  type ComboboxTranslate,
  comboboxMessages,
} from "./messages";
import {
  defaultOptionFilter,
  type OptionFilter,
  type RegisteredItem,
  useFilteredOptions,
} from "./use-filtered-options";

export type { RegisteredItem };

export type ComboboxFilter = OptionFilter;

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
  t: ComboboxTranslate;
};

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);
export const ComboboxGroupContext = createContext<string | null>(null);

export function useComboboxContext(component: string) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`${component} must be used within <Combobox>`);
  return context;
}

export interface ComboboxProps {
  children: ReactNode;
  /** The selected value, for controlled use. */
  value?: string;
  /** The initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the option value when the user picks an option. */
  onValueChange?: (value: string) => void;
  /** Whether the list is open, for controlled use. */
  open?: boolean;
  /** Whether the list starts open when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the next open state when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The search text, for controlled use. */
  query?: string;
  /** The initial search text when uncontrolled. Default: "" */
  defaultQuery?: string;
  /** Called with the new text when the query changes. It clears on close. */
  onQueryChange?: (query: string) => void;
  /** Return true to show an option for the query. Default: fuzzy match on value and keywords */
  filter?: ComboboxFilter;
  /** Disables the input and blocks opening the list. Default: false */
  disabled?: boolean;
  /** Play open and close swishes and a select on a pick. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
  /** Override any built-in string. */
  labels?: Partial<ComboboxMessages>;
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
  filter = defaultOptionFilter,
  disabled = false,
  sound = false,
  className,
  labels,
}: ComboboxProps) {
  const t = useMessages("combobox", comboboxMessages, labels);
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

  const playOpen = useSound(openSound, { enabled: sound });
  const playClose = useSound(closeSound, { enabled: sound });
  const playSelect = useSound(selectSound, { enabled: sound });

  // `quiet` skips the close sweep when a pick already made its own sound.
  const updateOpen = useCallback(
    (next: boolean, restoreFocus = false, quiet = false) => {
      if (disabled && next) return;
      if (next !== open) {
        if (!quiet) {
          if (next) playOpen();
          else playClose();
        }
        if (!openControlled) setInternalOpen(next);
        onOpenChange?.(next);
      }
      if (!next) updateQuery("");
      if (restoreFocus)
        requestAnimationFrame(() =>
          inputRef.current?.focus({ preventScroll: true }),
        );
    },
    [disabled, onOpenChange, open, openControlled, updateQuery, playOpen, playClose],
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
  } = useFilteredOptions({ open, query, value, filter });

  const select = useCallback(
    (next: string) => {
      if (items.get(next)?.disabled) return;
      playSelect();
      if (!valueControlled) setInternalValue(next);
      onValueChange?.(next);
      updateOpen(false, true, true);
    },
    [items, onValueChange, updateOpen, valueControlled, playSelect],
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

  const insideContent = useCallback(
    (target: Element) => Boolean(contentRef.current?.contains(target)),
    [],
  );
  const dismiss = useCallback(
    (reason: DismissReason) => updateOpen(false, reason === "escape"),
    [updateOpen],
  );
  useDismiss(open, dismiss, rootRef, { focusOutside: true, ignore: insideContent });

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
      select,
      selectActive,
      setActiveValue,
      t,
      unregisterItem,
      updateOpen,
      updateQuery,
      value,
      visibleCount,
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
