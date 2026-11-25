"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";
import {
  createContext,
  type ReactNode,
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
import { EASE_OUT } from "@/lib/ease";
import { type DismissReason, useDismiss } from "@/lib/hooks/use-dismiss";
import { type ListboxRow, useListbox } from "@/lib/hooks/use-listbox";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { selectSound } from "@/lib/sounds/select";
import { cn } from "@/lib/utils";

// One progress value drives the surface, gap, corners and chevron. This short
// spring suits the full reveal distance; each reader clamps its small internal
// overshoot, so all visible endpoints settle together. Rows share a short
// reveal so long lists have no late entries.
const UNFOLD_SPRING = {
  type: "spring",
  visualDuration: 0.2,
  bounce: 0.12,
} as const;
// Exits are faster than entrances: the panel folds back on a short ease.
const UNFOLD_EXIT = { duration: 0.15, ease: EASE_OUT } as const;
// Opened or closed from the keyboard: no motion at all.
const INSTANT = { duration: 0 } as const;
// The trigger's label rolls when the value changes: the old one rises out,
// faster than the new one rises in, with a 2px blur that hides the overlap.
const LABEL_IN = { duration: 0.18, ease: EASE_OUT } as const;
const LABEL_OUT = { duration: 0.12, ease: EASE_OUT } as const;
// The trigger is a pill (half its h-10 height). The panel is rounded-2xl, the
// radius every floating list in the library uses.
const TRIGGER_RADIUS = 20;
const PANEL_RADIUS = 16;
// How far the open panel sits from the trigger once it has pulled away.
const GAP = 8;
// The surface starts as a thin lip flush against the trigger's edge.
const LIP = 8;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// `custom` is the instant flag: rows of a list opened from the keyboard are
// simply there, like the panel around them.
const ITEM_VARIANTS: Variants = {
  // A shared short reveal keeps late rows in long, scrolled lists ready with
  // the surface. Per-index staggering can delay visible rows by over a second.
  hidden: (instant = false) => ({
    opacity: 0,
    y: -4,
    transition: instant ? INSTANT : { duration: 0.08, ease: EASE_OUT },
  }),
  show: (instant = false) => ({
    opacity: 1,
    y: 0,
    transition: instant ? INSTANT : { duration: 0.12, ease: EASE_OUT },
  }),
};

type Placement = "bottom" | "top";

interface SelectContextValue {
  value: string | undefined;
  open: boolean;
  /** `instant` skips the unfold: the keyboard asked for it. */
  setOpen: (open: boolean, quiet?: boolean, instant?: boolean) => void;
  select: (value: string, instant?: boolean) => void;
  register: (value: string, label: string, disabled: boolean) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  rows: ListboxRow[];
  /** Closes the panel; focus inside it returns to the trigger. */
  close: (quiet?: boolean, instant?: boolean) => void;
  /** Whether the latest open or close skips its animation. */
  instant: boolean;
  reduce: boolean;
  progress: MotionValue<number>;
  triggerId: string;
  listId: string;
  disabled: boolean;
  placement: Placement;
  setPlacement: (p: Placement) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);
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

function useSelectContext(component: string) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error(`${component} must be used within <Select>`);
  return ctx;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Controlled open state of the panel. A layout that stacks selects can hold
   * this to keep exactly one panel open — the panel is absolutely positioned
   * inside its field, so two open at once paint over each other's options.
   */
  open?: boolean;
  /** Uncontrolled initial open state. Default false. */
  defaultOpen?: boolean;
  /**
   * Fires whenever the panel opens or closes. The panel is absolutely
   * positioned inside the field, so a layout that stacks selects has to know
   * which one is open to paint it above its neighbours.
   */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Play open and close swishes and a select on a pick. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  className?: string;
  children: ReactNode;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  sound = false,
  className,
  children,
}: SelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internal, setInternal] = useState(defaultValue);
  const [labels, setLabels] = useState<
    Map<string, { label: string; disabled: boolean }>
  >(new Map());
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [instant, setInstant] = useState(false);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const openControlled = openProp !== undefined;
  const open = openControlled ? openProp : internalOpen;
  const progress = useMotionValue(open ? 1 : 0);

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
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, openControlled, open, playOpen, playClose],
  );

  // The panel turns inert as it closes, which would drop focus held inside it
  // on the page body. Hand it back to the trigger before that happens.
  const close = useCallback(
    (quiet = false, now = false) => {
      const trigger = document.getElementById(`${baseId}-trigger`);
      if (
        rootRef.current?.contains(document.activeElement) &&
        document.activeElement !== trigger
      )
        trigger?.focus();
      setOpen(false, quiet, now);
    },
    [baseId, setOpen],
  );

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
      const entry = m.get(v);
      if (entry?.label === label && entry.disabled === disabled) return m;
      return new Map(m).set(v, { label, disabled });
    });
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      if (!m.has(v)) return m;
      const next = new Map(m);
      next.delete(v);
      return next;
    });
  }, []);

  // Reduced motion has no travel, so the progress only carries a short fade.
  useEffect(() => {
    const animation = animate(
      progress,
      open ? 1 : 0,
      instant ? INSTANT : reduce ? { duration: 0.12 } : open ? UNFOLD_SPRING : UNFOLD_EXIT,
    );
    return () => animation.stop();
  }, [open, progress, reduce, instant]);

  // Escape hands focus back to the trigger and closes at once; an outside
  // press leaves focus where the press put it and folds the panel away.
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

  const ctx = useMemo<SelectContextValue>(
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
      instant,
      reduce,
      progress,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      disabled,
      placement,
      setPlacement,
    }),
    [
      current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labels,
      rows,
      close,
      instant,
      reduce,
      progress,
      baseId,
      disabled,
      placement,
    ],
  );

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const ctx = useSelectContext("SelectTrigger");
  const isTop = ctx.placement === "top";
  // The edge facing the panel flattens while the panel is attached to it and
  // rounds back as the panel pulls away — the two pinch apart — on the same
  // curve the panel moves on. The far edge stays rounded.
  const nearRadius = useTransform(
    ctx.progress,
    [0, 0.2, 0.4, 1],
    [TRIGGER_RADIUS, 0, 0, TRIGGER_RADIUS],
  );
  const rotate = useTransform(ctx.progress, (p) =>
    ctx.reduce ? (ctx.open ? 180 : 0) : Math.min(1, Math.max(0, p)) * 180,
  );
  return (
    <motion.button
      type="button"
      id={ctx.triggerId}
      disabled={ctx.disabled}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-controls={ctx.listId}
      // `detail` is 0 for a click the keyboard made (Enter, Space): no unfold.
      onClick={(event) => ctx.setOpen(!ctx.open, false, event.detail === 0)}
      onKeyDown={(event) => {
        if (
          !ctx.open &&
          (event.key === "ArrowDown" || event.key === "ArrowUp")
        ) {
          event.preventDefault();
          ctx.setOpen(true, false, true);
        }
      }}
      style={{
        borderTopLeftRadius: ctx.reduce || !isTop ? TRIGGER_RADIUS : nearRadius,
        borderTopRightRadius: ctx.reduce || !isTop ? TRIGGER_RADIUS : nearRadius,
        borderBottomLeftRadius: ctx.reduce || isTop ? TRIGGER_RADIUS : nearRadius,
        borderBottomRightRadius: ctx.reduce || isTop ? TRIGGER_RADIUS : nearRadius,
      }}
      className={cn(
        "relative z-10 flex h-10 w-full items-center justify-between gap-2 border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors",
        "hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-foreground/20",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
      <motion.span
        aria-hidden
        style={{ rotate }}
        className="text-muted-foreground"
      >
        <ChevronDown className="h-4 w-4" />
      </motion.span>
    </motion.button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const ctx = useSelectContext("SelectValue");
  const label = ctx.labelFor(ctx.value);
  const text = label ?? placeholder ?? "Select";
  // A pick from the keyboard swaps the label at once; reduced motion keeps a
  // short crossfade without the travel.
  const still = ctx.instant || ctx.reduce;
  const swap = ctx.instant ? INSTANT : ctx.reduce ? { duration: 0.12 } : LABEL_IN;
  return (
    // Both labels share one grid cell, so the outgoing one never takes space
    // or moves the chevron, and both truncate the same way.
    <span className={cn("grid min-w-0 flex-1 overflow-hidden text-left", className)}>
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          initial={still ? { opacity: 0 } : { opacity: 0, y: "70%", filter: "blur(2px)" }}
          animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
          exit={
            still
              ? { opacity: 0, transition: swap }
              : { opacity: 0, y: "-70%", filter: "blur(2px)", transition: LABEL_OUT }
          }
          transition={swap}
          className={cn(
            "col-start-1 row-start-1 block truncate",
            label ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const ctx = useSelectContext("SelectContent");
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { open, progress, reduce, setPlacement } = ctx;
  const { activeId, onKeyDown, moveTo } = useListbox({
    open,
    rows: ctx.rows,
    selected: ctx.value,
    list: panelRef,
  });
  const [glide, setGlide] = useState(true);
  const active = useMemo<ActiveOption>(
    () => ({ activeId, glide, setActive: moveTo }),
    [activeId, glide, moveTo],
  );

  // Keep descendants laid out while hidden: display:none resets nested
  // scrollers in Chromium. Collapse only the hidden outer footprint after
  // exit so it cannot extend page scrolling. Opening restores the full box
  // before measurement or focus; neither layout change is animated.
  const [exiting, setExiting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setExiting(true);
  }
  const present = open || exiting;
  useMotionValueEvent(progress, "animationComplete", () => {
    if (progress.get() === 0) setExiting(false);
  });

  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node || !present) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [present]);

  // On open, flip upward when there isn't room below and there's more above.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = document.getElementById(ctx.triggerId);
    const node = panelRef.current;
    if (!trigger || !node) return;
    const rect = trigger.getBoundingClientRect();
    const h = node.offsetHeight;
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    setPlacement(below < h + 16 && above > below ? "top" : "bottom");
  }, [open, ctx.triggerId, setPlacement]);

  const isTop = ctx.placement === "top";

  // Reveal a full-size panel from its near edge. No ancestor scales the list,
  // so rows, borders and shadow keep their natural thickness. The clip and
  // corner writes can paint; only the gap uses a transform. All read one
  // progress value, with no animated layout properties.
  const ready = height > 0 && !reduce;
  const fromY = ready ? (isTop ? GAP : -GAP) : 0;
  const detach = useTransform(progress, [0.4, 1], [0, 1]);
  const y = useTransform(detach, (d) => lerp(fromY, 0, d));
  const nearRadius = useTransform(detach, (d) => (ready ? PANEL_RADIUS * d : PANEL_RADIUS));
  const borderRadius = useTransform(nearRadius, (near) =>
    isTop
      ? `${PANEL_RADIUS}px ${PANEL_RADIUS}px ${near}px ${near}px`
      : `${near}px ${near}px ${PANEL_RADIUS}px ${PANEL_RADIUS}px`,
  );
  const clipPath = useTransform([progress, nearRadius], ([p, near]: number[]) => {
    if (!ready) return "none";
    // Clamp overshoot so the clip never extends into the trigger or exposes
    // overflowing children. At rest remove it so the native shadow is whole.
    const reveal = Math.min(1, Math.max(0, p));
    if (reveal === 1) return "none";
    const hidden = Math.max(0, (height - LIP) * (1 - reveal));
    const inset = isTop ? `${hidden}px 0 0 0` : `0 0 ${hidden}px 0`;
    const corners = isTop
      ? `${PANEL_RADIUS}px ${PANEL_RADIUS}px ${near}px ${near}px`
      : `${near}px ${near}px ${PANEL_RADIUS}px ${PANEL_RADIUS}px`;
    return `inset(${inset} round ${corners})`;
  });
  // The surface materialises over its first frames rather than popping in as
  // a lip; with reduced motion the fade is the whole entrance.
  const opacity = useTransform(progress, reduce ? [0, 1] : [0, 0.12], [0, 1]);

  return (
    <motion.div
      ref={panelRef}
      id={ctx.listId}
      role="listbox"
      aria-labelledby={ctx.triggerId}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(event) => {
        // Set before the key moves the active option, so its highlight jumps.
        setGlide(false);
        // Tab leaves the list from the trigger, so focus moves on to the
        // control after the select rather than into the closing panel.
        if (event.key === "Tab") ctx.close(false, true);
        else onKeyDown(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") setGlide(true);
      }}
      style={{
        visibility: present ? undefined : "hidden",
        maxHeight: present ? undefined : 0,
        borderWidth: present ? undefined : 0,
        y,
        clipPath,
        borderRadius,
        opacity,
        pointerEvents: open ? "auto" : "none",
        marginTop: isTop ? 0 : GAP,
        marginBottom: isTop ? GAP : 0,
      }}
      // flush against the trigger, then separates into its own rounded pill;
      // sits above or below depending on available space
      className={cn(
        // The same soft shadow as the menus, so floating lists read as one family.
        "absolute left-0 right-0 z-20 overflow-hidden border border-border bg-background shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]",
        isTop ? "bottom-full" : "top-full",
        className,
      )}
    >
      <ActiveOptionContext.Provider value={active}>
        <motion.div
          initial={false}
          animate={open ? "show" : "hidden"}
          className="p-2"
        >
          {children}
        </motion.div>
      </ActiveOptionContext.Provider>
    </motion.div>
  );
}

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function SelectItem({
  value,
  disabled = false,
  className,
  children,
}: SelectItemProps) {
  const ctx = useSelectContext("SelectItem");
  const { activeId, glide, setActive } = useContext(ActiveOptionContext);
  const selected = ctx.value === value;
  const active = activeId === value;
  const label = typeof children === "string" ? children : value;

  useLayoutEffect(() => {
    ctx.register(value, label, disabled);
  }, [ctx.register, value, label, disabled]);
  useLayoutEffect(() => () => ctx.unregister(value), [ctx.unregister, value]);

  return (
    <motion.div custom={ctx.instant} variants={ctx.reduce ? undefined : ITEM_VARIANTS}>
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
        // Enter or Space on the option (`detail` 0) closes without folding.
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
    </motion.div>
  );
}
