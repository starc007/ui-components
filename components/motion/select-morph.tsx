"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type ListboxRow, useListbox } from "@/lib/hooks/use-listbox";
import { cn } from "@/lib/utils";

// Shared-layout morph: trigger box grows into the panel and back, one surface.
const MORPH: Transition = { type: "spring", duration: 0.5, bounce: 0.22 };
// Trigger and panel header share this row so the morph stays seamless.
const ROW = "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm";

const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

interface MorphContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string, disabled: boolean) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  rows: ListboxRow[];
  /** Closes the panel; focus inside it returns to the trigger. */
  close: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  placeholder: string;
  setPlaceholder: (p: string) => void;
  reduce: boolean;
  layoutId: string;
  triggerId: string;
  listId: string;
  headerId: string;
  disabled: boolean;
}

const MorphContext = createContext<MorphContextValue | null>(null);
// The option keyboard focus is on, resolved during render by the content.
const ActiveOptionContext = createContext<string | undefined>(undefined);
// True inside the hidden copy that only keeps labels registered while closed.
const RegistrarContext = createContext(false);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphSelect>`);
  return ctx;
}

export interface MorphSelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Select whose trigger morphs into the panel via a shared layoutId — instead of
 * a separate dropdown opening, the trigger itself grows into the menu and
 * shrinks back, never detaching. Composable like `Select` (the gooey variant).
 */
export function MorphSelect({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
}: MorphSelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Set when the panel closes holding focus: the trigger is unmounted while
  // open, so focus can only go back once it has mounted again.
  const restoreFocus = useRef(false);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  // ref-counted: items render twice (hidden registrar + open panel), so a
  // label is only dropped once every copy with that value has unmounted.
  const [labels, setLabels] = useState<
    Map<string, { label: string; disabled: boolean; count: number }>
  >(new Map());
  const [placeholder, setPlaceholder] = useState("Select");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const close = useCallback(() => {
    if (rootRef.current?.contains(document.activeElement))
      restoreFocus.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      close();
    },
    [controlled, onValueChange, close],
  );

  const register = useCallback((v: string, label: string, disabled: boolean) => {
    setLabels((m) => {
      const next = new Map(m);
      next.set(v, { label, disabled, count: (m.get(v)?.count ?? 0) + 1 });
      return next;
    });
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      const entry = m.get(v);
      if (!entry) return m;
      const next = new Map(m);
      if (entry.count <= 1) next.delete(v);
      else next.set(v, { ...entry, count: entry.count - 1 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  const rows = useMemo(
    () =>
      Array.from(labels, ([id, entry]) => ({
        id,
        label: entry.label,
        disabled: entry.disabled,
      })),
    [labels],
  );

  const ctx = useMemo<MorphContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)?.label),
      rows,
      close,
      triggerRef,
      placeholder,
      setPlaceholder,
      reduce,
      layoutId: `${baseId}-surface`,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      headerId: `${baseId}-header`,
      disabled,
    }),
    [
      current,
      open,
      select,
      register,
      unregister,
      labels,
      rows,
      close,
      placeholder,
      reduce,
      baseId,
      disabled,
    ],
  );

  return (
    <MorphContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </MorphContext.Provider>
  );
}

export interface MorphSelectValueProps {
  placeholder?: string;
  className?: string;
}

export function MorphSelectValue({
  placeholder,
  className,
}: MorphSelectValueProps) {
  const ctx = useMorphContext("MorphSelectValue");
  // surface the placeholder so the morph header (rendered by content) matches
  useEffect(() => {
    if (placeholder) ctx.setPlaceholder(placeholder);
  }, [placeholder, ctx.setPlaceholder]);
  const label = ctx.labelFor(ctx.value);
  return (
    <span
      className={cn(label ? "text-foreground" : "text-muted-foreground", className)}
    >
      {label ?? placeholder ?? "Select"}
    </span>
  );
}

export interface MorphSelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export function MorphSelectTrigger({
  className,
  children,
}: MorphSelectTriggerProps) {
  const ctx = useMorphContext("MorphSelectTrigger");
  return (
    <>
      {/* invisible sizer reserves the closed height (the morph surface is
          absolute, so this keeps surrounding layout from shifting) */}
      <div
        aria-hidden
        inert
        className={cn(ROW, "invisible rounded-xl border border-border")}
      >
        {children}
        <ChevronDown className="h-4 w-4" />
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {!ctx.open ? (
          <motion.button
            key="trigger"
            ref={ctx.triggerRef}
            layoutId={ctx.layoutId}
            type="button"
            id={ctx.triggerId}
            disabled={ctx.disabled}
            aria-haspopup="listbox"
            aria-expanded={ctx.open}
            aria-controls={ctx.listId}
            onClick={() => ctx.setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                ctx.setOpen(true);
              }
            }}
            transition={ctx.reduce ? { duration: 0 } : MORPH}
            style={{ borderRadius: 12 }}
            className={cn(
              ROW,
              "absolute inset-x-0 top-0 z-10 border border-border bg-background text-foreground outline-none transition-colors",
              "hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-foreground/20",
              "disabled:pointer-events-none disabled:opacity-50",
              className,
            )}
          >
            <motion.span layout="position" className="min-w-0 truncate">
              {children}
            </motion.span>
            <motion.span layout="position" className="text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export interface MorphSelectContentProps {
  className?: string;
  children: ReactNode;
}

export function MorphSelectContent({
  className,
  children,
}: MorphSelectContentProps) {
  const ctx = useMorphContext("MorphSelectContent");
  const label = ctx.labelFor(ctx.value);
  const listRef = useRef<HTMLUListElement>(null);
  const { activeId, onKeyDown } = useListbox({
    open: ctx.open,
    rows: ctx.rows,
    selected: ctx.value,
    list: listRef,
  });
  return (
    <>
      {/* always-mounted, hidden — keeps item label registrations alive while
          closed so the trigger shows the selected value before first open */}
      <RegistrarContext.Provider value={true}>
        <div hidden>{children}</div>
      </RegistrarContext.Provider>

      <AnimatePresence initial={false} mode="popLayout">
        {ctx.open ? (
          <motion.div
            key="panel"
            layoutId={ctx.layoutId}
            transition={ctx.reduce ? { duration: 0 } : MORPH}
            style={{ borderRadius: 12 }}
            className={cn(
              "absolute inset-x-0 top-0 z-30 overflow-hidden border border-border bg-background shadow-lg",
              className,
            )}
          >
            {/* header mirrors the trigger (continuous morph) and collapses the
                panel back into the trigger when clicked */}
            <motion.button
              type="button"
              id={ctx.headerId}
              layout="position"
              aria-haspopup="listbox"
              aria-expanded
              aria-controls={ctx.listId}
              onClick={ctx.close}
              className={cn(ROW, "outline-none")}
            >
              <span
                className={cn(
                  "min-w-0 truncate",
                  label ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label ?? ctx.placeholder}
              </span>
              <motion.span
                aria-hidden
                animate={{ rotate: 180 }}
                transition={ctx.reduce ? { duration: 0 } : MORPH}
                className="text-muted-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </motion.button>

            <div className="h-px bg-border" />

            <ActiveOptionContext.Provider value={activeId}>
              <motion.ul
                ref={listRef}
                id={ctx.listId}
                role="listbox"
                aria-labelledby={ctx.headerId}
                initial="hidden"
                animate="show"
                variants={ctx.reduce ? undefined : LIST}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    event.preventDefault();
                    ctx.close();
                  } else onKeyDown(event);
                }}
                className="p-1"
              >
                {children}
              </motion.ul>
            </ActiveOptionContext.Provider>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export interface MorphSelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function MorphSelectItem({
  value,
  disabled = false,
  className,
  children,
}: MorphSelectItemProps) {
  const ctx = useMorphContext("MorphSelectItem");
  const activeId = useContext(ActiveOptionContext);
  const registrarOnly = useContext(RegistrarContext);
  const selected = ctx.value === value;
  const label = typeof children === "string" ? children : value;

  useLayoutEffect(() => {
    ctx.register(value, label, disabled);
    return () => ctx.unregister(value);
  }, [ctx.register, ctx.unregister, value, label, disabled]);

  // The hidden copy only registers; no stray options outside the listbox.
  if (registrarOnly) return null;

  return (
    <motion.li role="none" variants={ctx.reduce ? undefined : ITEM}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        // One tab stop: the active option, which focus follows while open.
        tabIndex={activeId === value ? 0 : -1}
        data-listbox-id={value}
        onClick={() => ctx.select(value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none transition-colors",
          selected
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {children}
        {selected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
      </button>
    </motion.li>
  );
}
