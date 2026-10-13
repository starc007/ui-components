"use client";

import { Check, ChevronDown } from "lucide-react";
import {
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
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

// One progress value drives the whole unfold: the surface, the gap, every
// corner and the chevron read the same curve. Rows use a short,
// shared reveal so long lists have no late entries. A little bounce makes the
// unfold a bounce rather than a slide; the panel spring would settle on a
// long creep here, which reads as late.
const UNFOLD_SPRING = {
  type: "spring",
  visualDuration: 0.2,
  bounce: 0.12,
} as const;
// Exits are faster than entrances: the panel folds back on a short ease.
const UNFOLD_EXIT = { duration: 0.2, ease: EASE_OUT } as const;
const RADIUS = 12;
// How far the open panel sits from the trigger once it has pulled away.
const GAP = 8;
// The surface starts as a thin lip flush against the trigger's edge.
const LIP = 8;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: {},
};
const ITEM_VARIANTS: Variants = {
  // A shared short reveal keeps late rows in long, scrolled lists ready with
  // the surface. Per-index staggering can delay visible rows by over a second.
  hidden: { opacity: 0, y: -4, transition: { duration: 0.08, ease: EASE_OUT } },
  show: { opacity: 1, y: 0, transition: { duration: 0.12, ease: EASE_OUT } },
};

type Placement = "bottom" | "top";

interface SelectContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  reduce: boolean;
  progress: MotionValue<number>;
  triggerId: string;
  listId: string;
  disabled: boolean;
  placement: Placement;
  setPlacement: (p: Placement) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

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
  className,
  children,
}: SelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internal, setInternal] = useState(defaultValue);
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const [placement, setPlacement] = useState<Placement>("bottom");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const openControlled = openProp !== undefined;
  const open = openControlled ? openProp : internalOpen;
  const progress = useMotionValue(open ? 1 : 0);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, openControlled],
  );

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange, setOpen],
  );

  const register = useCallback((v: string, label: string) => {
    setLabels((m) => (m.get(v) === label ? m : new Map(m).set(v, label)));
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
      reduce ? { duration: 0.12 } : open ? UNFOLD_SPRING : UNFOLD_EXIT,
    );
    return () => animation.stop();
  }, [open, progress, reduce]);

  // close on outside pointer / escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
  }, [open, setOpen]);

  const ctx = useMemo<SelectContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)),
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
    [RADIUS, 0, 0, RADIUS],
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
      onClick={() => ctx.setOpen(!ctx.open)}
      style={{
        borderTopLeftRadius: ctx.reduce || !isTop ? RADIUS : nearRadius,
        borderTopRightRadius: ctx.reduce || !isTop ? RADIUS : nearRadius,
        borderBottomLeftRadius: ctx.reduce || isTop ? RADIUS : nearRadius,
        borderBottomRightRadius: ctx.reduce || isTop ? RADIUS : nearRadius,
      }}
      className={cn(
        "relative z-10 flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors",
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
  return (
    <span
      className={cn(label ? "text-foreground" : "text-muted-foreground", className)}
    >
      {label ?? placeholder ?? "Select"}
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
  const nearRadius = useTransform(detach, (d) => (ready ? RADIUS * d : RADIUS));
  const borderRadius = useTransform(nearRadius, (near) =>
    isTop
      ? `${RADIUS}px ${RADIUS}px ${near}px ${near}px`
      : `${near}px ${near}px ${RADIUS}px ${RADIUS}px`,
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
      ? `${RADIUS}px ${RADIUS}px ${near}px ${near}px`
      : `${near}px ${near}px ${RADIUS}px ${RADIUS}px`;
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
      style={{
        visibility: present ? "visible" : "hidden",
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
        "absolute left-0 right-0 z-20 overflow-hidden border border-border bg-background shadow-lg",
        isTop ? "bottom-full" : "top-full",
        className,
      )}
    >
      <motion.div
        variants={reduce ? undefined : LIST_VARIANTS}
        initial={false}
        animate={open ? "show" : "hidden"}
        className="p-1"
      >
        {children}
      </motion.div>
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
  const selected = ctx.value === value;
  const label = typeof children === "string" ? children : value;

  useLayoutEffect(() => {
    ctx.register(value, label);
    return () => ctx.unregister(value);
  }, [ctx.register, ctx.unregister, value, label]);

  return (
    <motion.div variants={ctx.reduce ? undefined : ITEM_VARIANTS}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
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
    </motion.div>
  );
}
