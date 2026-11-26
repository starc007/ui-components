"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
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
import { MENU_ITEM_CLASS, MenuItemHighlight } from "@/components/motion/menu/menu-item-highlight";
import { SPRING_MORPH } from "@/lib/ease";
import { type DismissReason, useDismiss } from "@/lib/hooks/use-dismiss";
import { type ListboxRow, useListbox } from "@/lib/hooks/use-listbox";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { selectSound } from "@/lib/sounds/select";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

// Shared-layout morph: trigger box grows into the panel and back, one surface.
const MORPH = SPRING_MORPH;
// The fold back into the trigger: shorter than the open and without bounce,
// so the panel settles as it leaves instead of wobbling out. Local because it
// only exists as this morph's close.
const MORPH_CLOSE = { type: "spring", duration: 0.35, bounce: 0 } as const;
// Opened or closed from the keyboard: no motion at all.
const INSTANT = { duration: 0 } as const;
// Trigger and panel header share this row so the morph stays seamless.
const ROW = "flex h-10 w-full items-center justify-between gap-2 px-4 text-sm";
// The closed trigger is a pill (half its h-10 height). The open panel is
// rounded-2xl, the radius every floating list in the library uses.
const TRIGGER_RADIUS = 20;
const PANEL_RADIUS = 16;

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
  /** `instant` skips the morph: the keyboard asked for it. */
  setOpen: (open: boolean, quiet?: boolean, instant?: boolean) => void;
  select: (value: string, instant?: boolean) => void;
  /** Whether the latest open or close skips its animation. */
  instant: boolean;
  register: (value: string, label: string, disabled: boolean) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  rows: ListboxRow[];
  /** Closes the panel; focus inside it returns to the trigger. */
  close: (quiet?: boolean, instant?: boolean) => void;
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
// The active option (resolved during render by the content), whether its
// highlight glides (after the pointer) or jumps (after a key), and how a
// pointer resting on an option makes it the active one.
interface ActiveOption {
  activeId: string | undefined;
  glide: boolean;
  setActive: (id: string) => void;
}
const ActiveOptionContext = createContext<ActiveOption>({
  activeId: undefined,
  glide: true,
  setActive: () => {},
});
// True inside the hidden copy that only keeps labels registered while closed.
const RegistrarContext = createContext(false);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphSelect>`);
  return ctx;
}

export interface MorphSelectProps {
  /** The selected value, for controlled use. */
  value?: string;
  /** The initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the option's value when the user picks one. */
  onValueChange?: (value: string) => void;
  /** Disable the trigger so the panel cannot open. Default: false */
  disabled?: boolean;
  /** Play open and close swishes and a select on a pick. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
  children: ReactNode;
}

/**
 * Select whose trigger morphs into the panel via a shared layoutId — instead of
 * a separate dropdown opening, the trigger itself grows into the menu and
 * shrinks back, never detaching. Composable like `Select` (the unfold variant).
 */
export function MorphSelect({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  sound = false,
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
  const [open, setOpenState] = useState(false);
  const [instant, setInstant] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const playOpen = useSound(openSound, { enabled: sound });
  const playClose = useSound(closeSound, { enabled: sound });
  const playSelect = useSound(selectSound, { enabled: sound });

  // `quiet` skips the close sweep when a pick already made its own sound.
  const setOpen = useCallback(
    (next: boolean, quiet = false, now = false) => {
      if (next !== open) {
        if (!quiet) {
          if (next) playOpen();
          else playClose();
        }
        setInstant(now);
      }
      setOpenState(next);
    },
    [open, playOpen, playClose],
  );
  // ref-counted: items render twice (hidden registrar + open panel), so a
  // label is only dropped once every copy with that value has unmounted.
  const [labels, setLabels] = useState<
    Map<string, { label: string; disabled: boolean; count: number }>
  >(new Map());
  const [placeholder, setPlaceholder] = useState("Select");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const close = useCallback(
    (quiet = false, now = false) => {
      if (rootRef.current?.contains(document.activeElement))
        restoreFocus.current = true;
      setOpen(false, quiet, now);
    },
    [setOpen],
  );

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  const select = useCallback(
    (next: string, now = false) => {
      playSelect();
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      close(true, now);
    },
    [controlled, onValueChange, close, playSelect],
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

  // Escape closes at once; an outside press folds the panel back.
  const dismiss = useCallback(
    (reason: DismissReason) => (reason === "escape" ? close(false, true) : setOpen(false)),
    [close, setOpen],
  );
  useDismiss(open, dismiss, rootRef);

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
      instant,
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
      setOpen,
      select,
      instant,
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
  /** Text shown in the trigger and panel header before anything is picked. Default: "Select" */
  placeholder?: string;
  /** Classes merged onto the value text. */
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
  /** Classes merged onto the trigger button. */
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
        className={cn(ROW, "invisible rounded-full border border-border")}
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
            // `detail` is 0 for a click the keyboard made (Enter, Space): no morph.
            onClick={(event) => ctx.setOpen(true, false, event.detail === 0)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                ctx.setOpen(true, false, true);
              }
            }}
            // The trigger is what the panel morphs back into, so its
            // transition is the close.
            transition={ctx.reduce || ctx.instant ? INSTANT : MORPH_CLOSE}
            style={{ borderRadius: TRIGGER_RADIUS }}
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
  /** Classes merged onto the open panel. */
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
  const { activeId, onKeyDown, moveTo } = useListbox({
    open: ctx.open,
    rows: ctx.rows,
    selected: ctx.value,
    list: listRef,
  });
  const [glide, setGlide] = useState(true);
  const active = useMemo<ActiveOption>(
    () => ({ activeId, glide, setActive: moveTo }),
    [activeId, glide, moveTo],
  );
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
            transition={ctx.reduce || ctx.instant ? INSTANT : MORPH}
            style={{ borderRadius: PANEL_RADIUS }}
            className={cn(
              // The same soft shadow as the menus, so floating lists read as one family.
              "pointer-events-none absolute inset-x-0 top-0 z-30 overflow-hidden border border-border bg-background shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]",
              className,
            )}
          >
            {/* The panel sits over the returning trigger for the whole morph
                back, so its contents stop taking clicks and focus as soon as
                it starts leaving. The surface itself never takes pointer
                events, so the gate goes on this wrapper. */}
            <PresenceGate>
              {({ gate }) => (
                <div {...gate}>
                  {/* header mirrors the trigger (continuous morph) and
                      collapses the panel back into the trigger when clicked */}
                  <motion.button
                    type="button"
                    id={ctx.headerId}
                    layout="position"
                    aria-haspopup="listbox"
                    aria-expanded
                    aria-controls={ctx.listId}
                    onClick={(event) => ctx.close(false, event.detail === 0)}
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
                      transition={ctx.reduce || ctx.instant ? INSTANT : MORPH}
                      className="text-muted-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </motion.button>

                  <div className="h-px bg-border" />

                  <ActiveOptionContext.Provider value={active}>
                    <motion.ul
                      ref={listRef}
                      id={ctx.listId}
                      role="listbox"
                      aria-labelledby={ctx.headerId}
                      initial="hidden"
                      animate="show"
                      // The panel mounts fresh each open, so a keyboard open
                      // can simply leave the stagger out.
                      variants={ctx.reduce || ctx.instant ? undefined : LIST}
                      onKeyDown={(event) => {
                        // Set before the key moves the active option, so its highlight jumps.
                        setGlide(false);
                        if (event.key === "Tab") {
                          event.preventDefault();
                          ctx.close(false, true);
                        } else onKeyDown(event);
                      }}
                      onPointerMove={(event) => {
                        if (event.pointerType !== "touch") setGlide(true);
                      }}
                      className="p-2"
                    >
                      {children}
                    </motion.ul>
                  </ActiveOptionContext.Provider>
                </div>
              )}
            </PresenceGate>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export interface MorphSelectItemProps {
  /** Value reported when this option is picked. */
  value: string;
  /** Make the option unselectable and skip it in keyboard navigation. Default: false */
  disabled?: boolean;
  /** Classes merged onto the option button. */
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
  const { activeId, glide, setActive } = useContext(ActiveOptionContext);
  const registrarOnly = useContext(RegistrarContext);
  const selected = ctx.value === value;
  const active = activeId === value;
  const label = typeof children === "string" ? children : value;

  useLayoutEffect(() => {
    ctx.register(value, label, disabled);
    return () => ctx.unregister(value);
  }, [ctx.register, ctx.unregister, value, label, disabled]);

  // The hidden copy only registers; no stray options outside the listbox.
  if (registrarOnly) return null;

  return (
    <motion.li role="none" variants={ctx.reduce || ctx.instant ? undefined : ITEM}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        // One tab stop: the active option, which focus follows while open.
        tabIndex={active ? 0 : -1}
        data-listbox-id={value}
        // A resting pointer makes this the active option, so the highlight
        // follows the mouse the same way it follows the arrow keys.
        onPointerMove={(event) => {
          if (event.pointerType !== "touch" && !disabled && !active) setActive(value);
        }}
        // Enter or Space on the option (`detail` 0) closes without the morph.
        onClick={(event) => ctx.select(value, event.detail === 0)}
        className={cn(
          MENU_ITEM_CLASS,
          "justify-between gap-2 text-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {/* One highlight for the whole list: it glides after the pointer and
            jumps after a key. The selected option is marked by its check. */}
        {active && !disabled ? (
          <MenuItemHighlight
            layoutId={`${ctx.listId}-highlight`}
            reduce={ctx.reduce}
            instant={!glide}
          />
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
        {selected ? <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> : null}
      </button>
    </motion.li>
  );
}
