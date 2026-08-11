"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { motion, type Transition, useReducedMotion } from "motion/react";
import {
  createContext,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";

// Matches MorphSelect: one weighted surface grows into the panel and springs
// back through the same geometry when it closes.
const COMBOBOX_MORPH: Transition = {
  type: "spring",
  duration: 0.5,
  bounce: 0.22,
};

type RegisteredItem = {
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

type ComboboxContextValue = {
  open: boolean;
  setOpen: (open: boolean, restoreFocus?: boolean) => void;
  value: string | undefined;
  select: (value: string) => void;
  query: string;
  setQuery: (query: string) => void;
  activeValue: string | null;
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
  triggerRef: MutableRefObject<HTMLLabelElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  activeLayoutId: string;
};

const ComboboxContext = createContext<ComboboxContextValue | null>(null);
const ComboboxGroupContext = createContext<string | null>(null);

function useComboboxContext(component: string) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`${component} must be used within <Combobox>`);
  return context;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
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
  const triggerRef = useRef<HTMLLabelElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [activeValue, setActiveValue] = useState<string | null>(null);
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

  const visibleItems = useMemo(
    () =>
      Array.from(items.values()).filter((item) =>
        filter(item.value, query, [item.label, ...item.keywords]),
      ),
    [filter, items, query],
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

  const select = useCallback(
    (next: string) => {
      if (items.get(next)?.disabled) return;
      if (!valueControlled) setInternalValue(next);
      onValueChange?.(next);
      updateOpen(false, true);
    },
    [items, onValueChange, updateOpen, valueControlled],
  );

  const moveActive = useCallback(
    (direction: 1 | -1 | "first" | "last") => {
      if (!enabledVisibleItems.length) {
        setActiveValue(null);
        return;
      }

      if (direction === "first") {
        setActiveValue(enabledVisibleItems[0].value);
        return;
      }
      if (direction === "last") {
        setActiveValue(enabledVisibleItems.at(-1)?.value ?? null);
        return;
      }

      const currentIndex = enabledVisibleItems.findIndex(
        (item) => item.value === activeValue,
      );
      const nextIndex =
        currentIndex < 0
          ? direction === 1
            ? 0
            : enabledVisibleItems.length - 1
          : (currentIndex + direction + enabledVisibleItems.length) %
            enabledVisibleItems.length;
      setActiveValue(enabledVisibleItems[nextIndex].value);
    },
    [activeValue, enabledVisibleItems],
  );

  const selectActive = useCallback(() => {
    if (activeValue) select(activeValue);
  }, [activeValue, select]);

  useEffect(() => {
    if (!open) return;
    const selectedVisible = value && visibleValues.has(value) ? value : null;
    const activeVisible =
      activeValue && visibleValues.has(activeValue) ? activeValue : null;
    setActiveValue(
      activeVisible ?? selectedVisible ?? enabledVisibleItems[0]?.value ?? null,
    );
  }, [activeValue, enabledVisibleItems, open, value, visibleValues]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
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
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        updateOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      updateOpen(false, true);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
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
      isVisible: (itemValue) => !query.trim() || visibleValues.has(itemValue),
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
      moveActive,
      open,
      query,
      reduce,
      registerItem,
      select,
      selectActive,
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

export interface ComboboxTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxTrigger({ children, className }: ComboboxTriggerProps) {
  const context = useComboboxContext("ComboboxTrigger");

  return (
    <label
      ref={context.triggerRef}
      id={context.triggerId}
      htmlFor={context.inputId}
      data-state={context.open ? "open" : "closed"}
      className={cn(
        "relative z-20 flex h-10 w-full min-w-52 cursor-text items-center justify-between gap-3 rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-[border-color] hover:border-(--color-border-strong)",
        "focus-within:ring-2 focus-within:ring-foreground/20",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span aria-hidden className="shrink-0 text-muted-foreground">
        <ChevronsUpDown className="size-4" />
      </span>
    </label>
  );
}

export interface ComboboxValueProps {
  placeholder?: ReactNode;
  children?:
    | ReactNode
    | ((value: string | undefined, label: string | undefined) => ReactNode);
  className?: string;
}

export function ComboboxValue({
  placeholder = "Select an option",
  children,
  className,
}: ComboboxValueProps) {
  const context = useComboboxContext("ComboboxValue");
  const label = context.labelFor(context.value);
  const content =
    typeof children === "function"
      ? children(context.value, label)
      : children ?? label ?? placeholder;

  return (
    <span
      className={cn(
        "block truncate",
        context.value === undefined
          ? "text-muted-foreground"
          : "text-foreground",
        className,
      )}
    >
      {content}
    </span>
  );
}

export interface ComboboxContentProps {
  children: ReactNode;
  side?: Side;
  align?: Align;
  sideOffset?: number;
  avoidCollisions?: boolean;
  className?: string;
}

export function ComboboxContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className,
}: ComboboxContentProps) {
  const context = useComboboxContext("ComboboxContent");
  const measureRef = useRef<HTMLDivElement>(null);
  const [actualSide, setActualSide] = useState<Side>(side);
  const [surfaceHeight, setSurfaceHeight] = useState(0);
  const [morphReady, setMorphReady] = useState(false);

  useLayoutEffect(() => {
    const measureNode = measureRef.current;
    if (!measureNode) return;

    const measure = () => setSurfaceHeight(measureNode.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measureNode);
    const readyFrame = requestAnimationFrame(() => setMorphReady(true));
    return () => {
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    // Keep the resolved side while closing so a top panel also exits upward.
    if (!context.open) return;
    if (!avoidCollisions) {
      setActualSide(side);
      return;
    }
    const trigger = context.triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    if (side === "bottom" && below < surfaceHeight + sideOffset && above > below)
      setActualSide("top");
    else if (side === "top" && above < surfaceHeight + sideOffset && below > above)
      setActualSide("bottom");
    else setActualSide(side);
  }, [
    avoidCollisions,
    context.open,
    context.triggerRef,
    side,
    sideOffset,
    surfaceHeight,
  ]);

  const horizontalStyle =
    align === "end"
      ? { right: 0 }
      : align === "center"
        ? { left: "50%", transform: "translate3d(-50%, 0, 0)" }
        : { left: 0 };

  return (
    <motion.div
      ref={context.contentRef}
      data-combobox-content=""
      aria-hidden={!context.open}
      inert={!context.open}
      initial={false}
      animate={{
        height: context.open ? surfaceHeight : 0,
        opacity: context.open ? 1 : 0,
        marginTop:
          actualSide === "bottom" && context.open ? sideOffset : 0,
        marginBottom:
          actualSide === "top" && context.open ? sideOffset : 0,
      }}
      transition={
        context.reduce || !morphReady ? { duration: 0 } : COMBOBOX_MORPH
      }
      style={{
        ...horizontalStyle,
        top: actualSide === "bottom" ? "100%" : undefined,
        bottom: actualSide === "top" ? "100%" : undefined,
        pointerEvents: context.open ? "auto" : "none",
        transformOrigin: actualSide === "bottom" ? "top" : "bottom",
      }}
      className={cn(
        "absolute z-30 w-full overflow-hidden rounded-xl border border-border bg-background text-popover-foreground outline-none will-change-[height,margin]",
        className,
      )}
    >
      <motion.div
        ref={measureRef}
        initial={false}
        animate={{ opacity: context.open ? 1 : 0 }}
        transition={
          context.reduce || !morphReady ? { duration: 0 } : COMBOBOX_MORPH
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface ComboboxInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "value"
  > {
  ref?: Ref<HTMLInputElement>;
  wrapperClassName?: string;
}

export function ComboboxInput({
  ref,
  className,
  wrapperClassName,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  ...props
}: ComboboxInputProps) {
  const context = useComboboxContext("ComboboxInput");
  const selectedLabel = context.labelFor(context.value);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      context.setOpen(true);
      context.moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      context.setOpen(true);
      context.moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      context.moveActive("first");
    } else if (event.key === "End") {
      event.preventDefault();
      context.moveActive("last");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (context.open) context.selectActive();
      else context.setOpen(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        wrapperClassName,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <input
        {...props}
        ref={mergeRefs(ref, context.inputRef)}
        id={context.inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-activedescendant={context.activeItemId}
        autoComplete="off"
        disabled={context.disabled}
        value={context.open ? context.query : (selectedLabel ?? "")}
        placeholder={placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          event.preventDefault();
          context.inputRef.current?.focus({ preventScroll: true });
          context.setOpen(true);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onClick={(event) => {
          context.setOpen(true);
          onClick?.(event);
        }}
        onChange={(event) => {
          context.setOpen(true);
          context.setQuery(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className,
        )}
      />
    </div>
  );
}

export interface ComboboxListProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function ComboboxList({
  children,
  ariaLabel = "Options",
  className,
}: ComboboxListProps) {
  const context = useComboboxContext("ComboboxList");
  return (
    <div
      id={context.listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={context.inputId}
      className={cn(
        "max-h-64 overflow-y-auto overscroll-contain p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ComboboxGroupProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxGroup({ children, className }: ComboboxGroupProps) {
  const context = useComboboxContext("ComboboxGroup");
  const groupId = useId();
  return (
    <ComboboxGroupContext.Provider value={groupId}>
      <fieldset
        hidden={!context.hasVisibleItems(groupId)}
        className={cn("m-0 min-w-0 border-0 p-0 py-0.5", className)}
      >
        {children}
      </fieldset>
    </ComboboxGroupContext.Provider>
  );
}

export interface ComboboxLabelProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxLabel({ children, className }: ComboboxLabelProps) {
  const groupId = useContext(ComboboxGroupContext);
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

export interface ComboboxItemProps {
  value: string;
  children: ReactNode;
  textValue?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
}

export function ComboboxItem({
  value,
  children,
  textValue,
  keywords = [],
  disabled = false,
  onSelect,
  className,
}: ComboboxItemProps) {
  const context = useComboboxContext("ComboboxItem");
  const groupId = useContext(ComboboxGroupContext);
  const id = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const label = textValue ?? (typeof children === "string" ? children : value);
  const visible = context.isVisible(value);
  const active = context.activeValue === value;
  const selected = context.value === value;
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
      data-combobox-item=""
      data-active={active || undefined}
      data-selected={selected || undefined}
      onPointerMove={() => {
        if (!disabled) context.setActiveValue(value);
      }}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => {
        if (disabled) return;
        onSelect?.(value);
        context.select(value);
      }}
      className={cn(
        "relative isolate flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors duration-150",
        active ? "text-foreground" : "text-muted-foreground",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
    >
      {active ? (
        <motion.span
          aria-hidden
          layoutId={context.activeLayoutId}
          className="absolute inset-0 -z-10 rounded-lg bg-muted"
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
        />
      ) : null}
      <span className="min-w-0 flex-1">{children}</span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.82)",
        }}
        transition={
          context.reduce
            ? { duration: 0 }
            : { duration: 0.14, ease: EASE_OUT }
        }
        className="grid size-5 shrink-0 place-items-center text-foreground"
      >
        <Check className="size-4" />
      </motion.span>
    </button>
  );
}

export interface ComboboxEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function ComboboxEmpty({
  children = "No options found.",
  className,
}: ComboboxEmptyProps) {
  const context = useComboboxContext("ComboboxEmpty");
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

export interface ComboboxSeparatorProps {
  className?: string;
}

export function ComboboxSeparator({ className }: ComboboxSeparatorProps) {
  return (
    <div
      aria-hidden
      className={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}
