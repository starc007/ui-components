"use client";

import { Check, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactElement,
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
import { createPortal } from "react-dom";
import { usePopoverPortalPosition } from "@/components/motion/popover-position";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

const VIEWPORT_PADDING = 8;
// The panel's border and padding, so a submenu's first row lines up with the
// row that opened it.
const SUB_ALIGN_OFFSET = 9;
// How far a submenu stacked under its row sits in, so it reads as nested.
const SUB_STACK_INDENT = 16;
// Long enough to skip the submenus a pointer crosses on its way somewhere else.
const SUB_OPEN_DELAY = 100;
// How long a pointer heading for an open submenu may cross sibling rows.
const SUB_GRACE = 300;
const TYPEAHEAD_RESET = 500;
const EXIT = { duration: 0.12, ease: EASE_OUT };
// The panel grows out of its trigger from this scale and distance.
const OPEN_SCALE = 0.94;
const OPEN_TRAVEL = 6;
const OPEN = { duration: 0.2, ease: EASE_OUT };

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";
type FocusTarget = "first" | "last" | "panel" | "none";
type Point = { x: number; y: number };

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  "data-state"?: "open" | "closed";
};

interface RootContextValue {
  open: boolean;
  setOpen: (open: boolean, focus?: FocusTarget) => void;
  focusTarget: FocusTarget;
  menuId: string;
  triggerId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  reduce: boolean;
  mounted: boolean;
}

const RootContext = createContext<RootContextValue | null>(null);

function useRoot(component: string) {
  const context = useContext(RootContext);
  if (!context) throw new Error(`${component} must be used within <DropdownMenu>`);
  return context;
}

/** One open panel: the root menu or a submenu. */
interface LevelContextValue {
  levelId: string;
  present: boolean;
  panelRef: MutableRefObject<HTMLDivElement | null>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  openSub: string | null;
  setOpenSub: (id: string | null, focus?: FocusTarget) => void;
  subFocus: FocusTarget;
  /** A pointer on its way from a submenu trigger to the submenu it opened. */
  grace: MutableRefObject<{ polygon: Point[]; until: number } | null>;
}

const LevelContext = createContext<LevelContextValue | null>(null);

function useLevel(component: string) {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error(`${component} must be used within <DropdownMenuContent>`);
  }
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function enabledItems(panel: HTMLElement | null) {
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      `[data-menu-item][data-level="${panel.dataset.level}"]:not([data-disabled])`,
    ),
  );
}

function insidePolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

type Placement = {
  left: number;
  top: number;
  side: Side;
  origin: string;
  /** The room on the chosen side; a taller menu scrolls inside it. */
  maxHeight: number;
};

type Rect = { left: number; top: number; width: number; height: number };

function placeVertical(
  trigger: Rect,
  size: { width: number; height: number },
  side: "top" | "bottom",
  align: Align,
  offset: number,
): Placement {
  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = window.innerHeight;
  const below = trigger.top + trigger.height + offset;
  const roomBelow = viewHeight - VIEWPORT_PADDING - below;
  const roomAbove = trigger.top - offset - VIEWPORT_PADDING;
  // The preferred side when the menu fits there, otherwise the roomier one.
  const used =
    side === "bottom"
      ? size.height <= roomBelow || roomBelow >= roomAbove
        ? "bottom"
        : "top"
      : size.height <= roomAbove || roomAbove >= roomBelow
        ? "top"
        : "bottom";
  const maxHeight = Math.max(used === "bottom" ? roomBelow : roomAbove, 0);
  const height = Math.min(size.height, maxHeight);
  const start =
    align === "start"
      ? trigger.left
      : align === "end"
        ? trigger.left + trigger.width - size.width
        : trigger.left + trigger.width / 2 - size.width / 2;
  const x = clamp(start, VIEWPORT_PADDING, viewWidth - size.width - VIEWPORT_PADDING);
  const y = used === "bottom" ? below : trigger.top - offset - height;
  // Grow from the aligned edge, so that edge holds still while the panel
  // scales in instead of sliding sideways into place.
  const anchorX =
    align === "start"
      ? trigger.left
      : align === "end"
        ? trigger.left + trigger.width
        : trigger.left + trigger.width / 2;
  const originX = clamp(anchorX - x, 0, size.width);
  return {
    left: x,
    top: y,
    side: used,
    origin: `${originX}px ${used === "bottom" ? 0 : height}px`,
    maxHeight,
  };
}

function place(
  trigger: Rect,
  size: { width: number; height: number },
  side: Side,
  align: Align,
  offset: number,
): Placement {
  if (side === "top" || side === "bottom") {
    return placeVertical(trigger, size, side, align, offset);
  }

  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = window.innerHeight;
  const right = trigger.left + trigger.width + offset;
  const left = trigger.left - size.width - offset;
  const fitsRight = right + size.width <= viewWidth - VIEWPORT_PADDING;
  const fitsLeft = left >= VIEWPORT_PADDING;
  // A narrow screen has room on neither side: drop below the row instead of
  // covering it, the way a phone stacks a submenu.
  if (!fitsRight && !fitsLeft) {
    return placeVertical(
      { ...trigger, left: trigger.left + SUB_STACK_INDENT, width: trigger.width - SUB_STACK_INDENT },
      size,
      "bottom",
      "start",
      2,
    );
  }
  const used: Side = side === "right" ? (fitsRight ? "right" : "left") : fitsLeft ? "left" : "right";
  const maxHeight = viewHeight - VIEWPORT_PADDING * 2;
  const height = Math.min(size.height, maxHeight);
  const x = used === "right" ? right : left;
  const y = clamp(trigger.top - SUB_ALIGN_OFFSET, VIEWPORT_PADDING, viewHeight - height - VIEWPORT_PADDING);
  const originY = clamp(trigger.top + trigger.height / 2 - y, 0, height);
  return {
    left: x,
    top: y,
    side: used,
    origin: `${used === "right" ? 0 : size.width}px ${originY}px`,
    maxHeight,
  };
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>("first");
  const [mounted, setMounted] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuId = useId();
  const triggerId = useId();
  const reduce = useReducedMotion() ?? false;

  useEffect(() => setMounted(true), []);

  const setOpen = useCallback(
    (next: boolean, focus: FocusTarget = "first") => {
      if (next) setFocusTarget(focus);
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  // Focus goes back to the trigger when the menu closes from inside it, or
  // with nothing focused. A click elsewhere keeps the focus it landed on.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (open) return;
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      active.closest(`[data-menu-root="${CSS.escape(menuId)}"]`)
    ) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open, menuId]);

  const value = useMemo<RootContextValue>(
    () => ({
      open,
      setOpen,
      focusTarget,
      menuId,
      triggerId,
      triggerRef,
      reduce,
      mounted,
    }),
    [open, setOpen, focusTarget, menuId, triggerId, reduce, mounted],
  );

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuTriggerProps {
  /** A single focusable element, usually a button. */
  children: ReactElement<TriggerElementProps>;
  disabled?: boolean;
}

export function DropdownMenuTrigger({ children, disabled = false }: DropdownMenuTriggerProps) {
  const root = useRoot("DropdownMenuTrigger");
  if (!isValidElement(children)) {
    throw new Error("<DropdownMenuTrigger> requires a single React element");
  }
  const childProps = children.props;
  const childRef = children.props.ref;

  return cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      root.triggerRef.current = node;
      assignRef(childRef, node);
    },
    id: childProps.id ?? root.triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": root.open,
    "aria-controls": root.open ? root.menuId : undefined,
    "data-state": root.open ? "open" : "closed",
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      childProps.onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      // `detail` is 0 for a click the keyboard synthesized from Enter or Space:
      // that opener wants the first row, a pointer wants no row picked yet.
      root.setOpen(!root.open, event.detail === 0 ? "first" : "panel");
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        root.setOpen(true, event.key === "ArrowDown" ? "first" : "last");
      }
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Panel (shared by the menu and its submenus)                                */
/* -------------------------------------------------------------------------- */

interface PanelProps {
  children: ReactNode;
  className?: string;
  id: string;
  anchorRef: MutableRefObject<HTMLElement | null>;
  side: Side;
  align: Align;
  sideOffset: number;
  focus: FocusTarget;
  present: boolean;
  gate: { inert: boolean; style: { pointerEvents: "auto" | "none" } };
  labelledBy: string;
  onClose: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => boolean;
  onPointerEnter?: () => void;
  panelRef: MutableRefObject<HTMLDivElement | null>;
}

function MenuPanel({
  children,
  className,
  id,
  anchorRef,
  side,
  align,
  sideOffset,
  focus,
  present,
  gate,
  labelledBy,
  onClose,
  onKeyDown,
  onPointerEnter,
  panelRef,
}: PanelProps) {
  const root = useRoot("DropdownMenuContent");
  const parent = useContext(LevelContext);
  const levelId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openSub, setOpenSubState] = useState<string | null>(null);
  const [subFocus, setSubFocus] = useState<FocusTarget>("none");
  const grace = useRef<{ polygon: Point[]; until: number } | null>(null);
  const typeahead = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const layout = usePopoverPortalPosition(anchorRef, panelRef, true);
  // Held once placed: an exiting panel stays where it was, even if the
  // trigger scrolls away under it.
  const [placement, setPlacement] = useState<Placement | null>(null);
  useLayoutEffect(() => {
    if (!layout || !present) return;
    // A submenu measures its gap from the parent panel's edge, not from the
    // row inside it, so the two panels never touch.
    const edge = parent?.panelRef.current?.getBoundingClientRect();
    const anchor = edge ? { ...layout.trigger, left: edge.left, width: edge.width } : layout.trigger;
    setPlacement(place(anchor, layout.content, side, align, sideOffset));
  }, [layout, present, side, align, sideOffset, parent]);

  const setOpenSub = useCallback((next: string | null, nextFocus: FocusTarget = "none") => {
    setSubFocus(nextFocus);
    setOpenSubState(next);
  }, []);

  // Waits for the first placement: the panel is `visibility: hidden` until
  // then, and the browser will not focus anything inside it.
  const placed = placement !== null;
  useEffect(() => {
    const panel = panelRef.current;
    // `present` too: reopening during the exit brings this same panel back.
    if (!placed || !present || !panel || focus === "none") return;
    if (focus === "panel") {
      panel.focus({ preventScroll: true });
      return;
    }
    const items = enabledItems(panel);
    (focus === "last" ? items[items.length - 1] : items[0])?.focus({ preventScroll: true });
  }, [placed, present, focus, panelRef]);

  useEffect(
    () => () => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    },
    [],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Submenus render inside this panel's React tree, so their keys bubble
    // here too. Each panel answers only for its own rows.
    const panel = panelRef.current;
    const target = event.target as HTMLElement;
    if (!panel || target.closest("[data-menu-panel]") !== panel) return;
    if (onKeyDown?.(event)) return;

    const items = enabledItems(panel);
    const index = items.indexOf(target);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = index < 0 ? (step === 1 ? 0 : items.length - 1) : (index + step + items.length) % items.length;
      items[next]?.focus();
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      onClose();
      return;
    }
    const typed = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (!typed || (event.key === " " && typeahead.current === "")) return;
    typeahead.current += event.key.toLocaleLowerCase();
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    typeaheadTimer.current = setTimeout(() => {
      typeahead.current = "";
    }, TYPEAHEAD_RESET);
    // Start after the current row, so repeating a letter cycles its matches.
    const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
    const query = typeahead.current;
    const repeated = query.length > 1 && [...query].every((char) => char === query[0]);
    const needle = repeated ? query[0] : query;
    const match = ordered.find((item) =>
      (item.dataset.textValue ?? item.textContent ?? "").trim().toLocaleLowerCase().startsWith(needle),
    );
    if (match) {
      event.preventDefault();
      match.focus();
    }
  };

  const level = useMemo<LevelContextValue>(
    () => ({
      levelId,
      present,
      panelRef,
      activeId,
      setActiveId,
      openSub,
      setOpenSub,
      subFocus,
      grace,
    }),
    [levelId, present, panelRef, activeId, openSub, setOpenSub, subFocus],
  );

  // The panel starts tucked toward its trigger and springs out of it.
  const used = placement?.side ?? side;
  const toward = used === "top" || used === "left" ? 1 : -1;
  const vertical = used === "top" || used === "bottom";
  const offset = (distance: number) => (vertical ? { y: distance * toward } : { x: distance * toward });
  const variants: Variants = root.reduce
    ? {
        hidden: { opacity: 0 },
        shown: { opacity: 1, transition: { duration: 0.15, ease: EASE_OUT } },
        gone: { opacity: 0, transition: EXIT },
      }
    : {
        hidden: { opacity: 0, scale: OPEN_SCALE, ...offset(OPEN_TRAVEL) },
        shown: {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          transition: {
            ...OPEN,
            opacity: { duration: 0.12, ease: EASE_OUT },
          },
        },
        gone: { opacity: 0, scale: 0.97, ...offset(OPEN_TRAVEL / 2), transition: EXIT },
      };

  return createPortal(
    <motion.div
      {...gate}
      ref={panelRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-orientation="vertical"
      tabIndex={-1}
      data-menu-panel=""
      data-menu-root={root.menuId}
      data-level={levelId}
      data-side={placement?.side ?? side}
      variants={variants}
      initial="hidden"
      animate="shown"
      exit="gone"
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        if (event.target === event.currentTarget) setActiveId(null);
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={(event) => {
        // Leaving the panel drops the highlight, unless the row it sits on
        // owns the open submenu the pointer is heading into.
        if (event.pointerType === "touch" || openSub) return;
        const panel = panelRef.current;
        if (panel?.contains(document.activeElement)) panel.focus({ preventScroll: true });
      }}
      style={{
        ...gate.style,
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.origin,
        maxHeight: placement?.maxHeight,
        visibility: placement ? undefined : "hidden",
      }}
      className={cn(
        "fixed z-[100] min-w-48 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background p-2 text-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)] outline-none",
        parent && "z-[101]",
        className,
      )}
    >
      <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
    </motion.div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  /** Preferred side. Flips when the viewport has no room. Default "bottom". */
  side?: "top" | "bottom";
  /** Default "start". */
  align?: Align;
  /** Gap between trigger and menu in px. Default 6. */
  sideOffset?: number;
}

export function DropdownMenuContent({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
}: DropdownMenuContentProps) {
  const root = useRoot("DropdownMenuContent");
  const panelRef = useRef<HTMLDivElement | null>(null);

  const { setOpen, triggerRef, menuId } = root;
  const close = useCallback(() => setOpen(false), [setOpen]);
  const ignore = useCallback(
    (target: Element) =>
      Boolean(triggerRef.current?.contains(target)) ||
      Boolean(target.closest(`[data-menu-root="${CSS.escape(menuId)}"]`)),
    [triggerRef, menuId],
  );
  useDismiss(root.open, close, null, { ignore });

  if (!root.mounted) return null;

  return (
    <AnimatePresence>
      {root.open && (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <MenuPanel
              id={root.menuId}
              anchorRef={root.triggerRef}
              panelRef={panelRef}
              side={side}
              align={align}
              sideOffset={sideOffset}
              focus={root.focusTarget}
              present={isPresent}
              gate={gate}
              labelledBy={root.triggerRef.current?.id ?? root.triggerId}
              onClose={close}
              className={className}
            >
              {children}
            </MenuPanel>
          )}
        </PresenceGate>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Items                                                                      */
/* -------------------------------------------------------------------------- */

type ItemTone = "default" | "destructive";

export interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Close the whole menu after selecting. Default true. */
  closeOnSelect?: boolean;
  tone?: ItemTone;
  /** Indent to line up with rows that start with an icon. */
  inset?: boolean;
  /** Text matched by typeahead when the label is not plain text. */
  textValue?: string;
  className?: string;
}

interface ItemBaseProps extends DropdownMenuItemProps {
  role?: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  checked?: boolean;
  subTrigger?: {
    id: string;
    open: boolean;
    controls: string;
    onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
    onClick: () => void;
    ref: MutableRefObject<HTMLElement | null>;
  };
}

function ItemBase({
  children,
  onSelect,
  disabled = false,
  closeOnSelect = true,
  tone = "default",
  inset = false,
  textValue,
  className,
  role = "menuitem",
  checked,
  subTrigger,
}: ItemBaseProps) {
  const root = useRoot("DropdownMenuItem");
  const level = useLevel("DropdownMenuItem");
  const ownId = useId();
  const id = subTrigger?.id ?? ownId;
  const active = level.activeId === id;

  return (
    <button
      type="button"
      ref={(node) => {
        if (subTrigger) subTrigger.ref.current = node;
      }}
      id={id}
      role={role}
      {...(role === "menuitem" ? {} : { "aria-checked": checked })}
      aria-haspopup={subTrigger ? "menu" : undefined}
      aria-expanded={subTrigger ? subTrigger.open : undefined}
      aria-controls={subTrigger?.open ? subTrigger.controls : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      data-menu-item=""
      data-level={level.levelId}
      data-disabled={disabled ? "" : undefined}
      data-highlighted={active ? "" : undefined}
      data-text-value={textValue}
      onFocus={() => {
        level.setActiveId(id);
        // Moving to another row of this menu closes a submenu it does not own.
        if (level.openSub && level.openSub !== subTrigger?.id) level.setOpenSub(null);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        // On the way to an open submenu, crossing this row changes nothing.
        const grace = level.grace.current;
        if (grace && Date.now() < grace.until && insidePolygon({ x: event.clientX, y: event.clientY }, grace.polygon)) {
          return;
        }
        level.grace.current = null;
        if (subTrigger) {
          subTrigger.onPointerMove(event);
          return;
        }
        if (level.openSub) level.setOpenSub(null);
        if (disabled) {
          if (level.panelRef.current?.contains(document.activeElement)) {
            level.panelRef.current.focus({ preventScroll: true });
          }
          return;
        }
        if (document.activeElement !== event.currentTarget) {
          event.currentTarget.focus({ preventScroll: true });
        }
      }}
      onPointerLeave={subTrigger?.onPointerLeave}
      onKeyDown={subTrigger?.onKeyDown}
      onClick={() => {
        if (disabled) return;
        if (subTrigger) {
          subTrigger.onClick();
          return;
        }
        onSelect?.();
        if (closeOnSelect) root.setOpen(false);
      }}
      className={cn(
        "relative isolate flex w-full cursor-default select-none items-center gap-2 rounded-full px-3 py-1.5 text-left text-sm outline-none",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        inset && "pl-9",
        disabled && "opacity-50",
        tone === "destructive" ? "text-destructive [&_svg]:text-destructive" : "[&_svg]:text-muted-foreground",
        className,
      )}
    >
      {active && !disabled ? (
        <motion.span
          aria-hidden="true"
          layoutId={`${level.levelId}-highlight`}
          className={cn(
            "absolute inset-0 -z-10 rounded-full",
            tone === "destructive" ? "bg-destructive/10" : "bg-foreground/[0.07]",
          )}
          transition={root.reduce ? { duration: 0 } : SPRING_LAYOUT}
        />
      ) : null}
      {children}
    </button>
  );
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  return <ItemBase {...props} />;
}

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, "onSelect" | "tone" | "inset"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Stays open after a toggle by default, so the check can be seen landing. */
export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  closeOnSelect = false,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const root = useRoot("DropdownMenuCheckboxItem");
  return (
    <ItemBase
      {...props}
      role="menuitemcheckbox"
      checked={checked}
      closeOnSelect={closeOnSelect}
      onSelect={() => onCheckedChange?.(!checked)}
    >
      {children}
      {/* The mark sits at the end of the row, never before the label. */}
      <span aria-hidden="true" className="ml-auto flex size-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false}>
          {checked ? (
            <motion.span
              key="check"
              initial={root.reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={root.reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={root.reduce ? { duration: 0.1 } : SPRING_PANEL}
              className="flex"
            >
              <Check className="size-3.5 text-foreground" strokeWidth={2.4} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </ItemBase>
  );
}

interface RadioGroupContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface DropdownMenuRadioGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function DropdownMenuRadioGroup({ value, onValueChange, children, className }: DropdownMenuRadioGroupProps) {
  const context = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <RadioGroupContext.Provider value={context}>
      <div className={className}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

export interface DropdownMenuRadioItemProps extends Omit<DropdownMenuItemProps, "onSelect" | "tone" | "inset"> {
  value: string;
}

/** Stays open after a pick by default, so the check can be seen moving. */
export function DropdownMenuRadioItem({ value, closeOnSelect = false, children, ...props }: DropdownMenuRadioItemProps) {
  const root = useRoot("DropdownMenuRadioItem");
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("DropdownMenuRadioItem must be used within <DropdownMenuRadioGroup>");
  const checked = group.value === value;
  return (
    <ItemBase
      {...props}
      role="menuitemradio"
      checked={checked}
      closeOnSelect={closeOnSelect}
      onSelect={() => group.onValueChange?.(value)}
    >
      {children}
      {/* The mark sits at the end of the row, never before the label. */}
      <span aria-hidden="true" className="ml-auto flex size-4 shrink-0 items-center justify-center">
        <motion.span
          initial={false}
          animate={root.reduce ? { opacity: checked ? 1 : 0 } : { opacity: checked ? 1 : 0, scale: checked ? 1 : 0.6 }}
          transition={root.reduce ? { duration: 0.1 } : SPRING_PANEL}
          className="flex"
        >
          <Check className="size-3.5 text-foreground" strokeWidth={2.4} />
        </motion.span>
      </span>
    </ItemBase>
  );
}

/* -------------------------------------------------------------------------- */
/* Submenus                                                                   */
/* -------------------------------------------------------------------------- */

interface SubContextValue {
  id: string;
  contentId: string;
  open: boolean;
  focus: FocusTarget;
  triggerRef: MutableRefObject<HTMLElement | null>;
  panelRef: MutableRefObject<HTMLDivElement | null>;
  setOpen: (open: boolean, focus?: FocusTarget) => void;
}

const SubContext = createContext<SubContextValue | null>(null);

function useSub(component: string) {
  const context = useContext(SubContext);
  if (!context) throw new Error(`${component} must be used within <DropdownMenuSub>`);
  return context;
}

export interface DropdownMenuSubProps {
  children: ReactNode;
}

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const level = useLevel("DropdownMenuSub");
  const id = useId();
  const contentId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // Closes with its parent: an exiting menu takes its submenu out with it.
  const open = level.openSub === id && level.present;
  const { setOpenSub } = level;
  const setOpen = useCallback(
    (next: boolean, focus: FocusTarget = "none") => setOpenSub(next ? id : null, focus),
    [setOpenSub, id],
  );
  const value = useMemo(
    () => ({ id, contentId, open, focus: level.subFocus, triggerRef, panelRef, setOpen }),
    [id, contentId, open, level.subFocus, setOpen],
  );
  return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

export interface DropdownMenuSubTriggerProps {
  children: ReactNode;
  disabled?: boolean;
  inset?: boolean;
  textValue?: string;
  className?: string;
}

export function DropdownMenuSubTrigger({ children, disabled, inset, textValue, className }: DropdownMenuSubTriggerProps) {
  const level = useLevel("DropdownMenuSubTrigger");
  const sub = useSub("DropdownMenuSubTrigger");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  return (
    <ItemBase
      disabled={disabled}
      inset={inset}
      textValue={textValue}
      className={className}
      subTrigger={{
        id: sub.id,
        open: sub.open,
        controls: sub.contentId,
        ref: sub.triggerRef,
        onPointerMove: (event) => {
          if (document.activeElement !== event.currentTarget) {
            event.currentTarget.focus({ preventScroll: true });
          }
          if (disabled || sub.open || timer.current) return;
          // Another row's submenu closes as soon as the pointer settles here.
          if (level.openSub) level.setOpenSub(null);
          timer.current = setTimeout(() => {
            timer.current = null;
            sub.setOpen(true, "none");
          }, SUB_OPEN_DELAY);
        },
        onPointerLeave: (event) => {
          clearTimer();
          const panel = sub.panelRef.current;
          if (!sub.open || !panel || event.pointerType === "touch") return;
          // Leave a corridor from the pointer to the submenu's near edge, so a
          // diagonal path across the rows below does not close it.
          const rect = panel.getBoundingClientRect();
          const right = rect.left >= event.clientX;
          const edge = right ? rect.left : rect.right;
          const back = right ? -5 : 5;
          level.grace.current = {
            polygon: [
              { x: event.clientX + back, y: event.clientY },
              { x: edge, y: rect.top },
              { x: edge, y: rect.bottom },
            ],
            until: Date.now() + SUB_GRACE,
          };
        },
        onKeyDown: (event) => {
          if (disabled) return;
          if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            sub.setOpen(true, "first");
            // Already open from a hover: the panel's focus effect will not run
            // again, so hand focus in here.
            if (sub.open) enabledItems(sub.panelRef.current)[0]?.focus();
          }
        },
        onClick: () => {
          if (!disabled) sub.setOpen(true, "first");
        },
      }}
    >
      {children}
      <ChevronRight aria-hidden="true" className="ml-auto size-4" />
    </ItemBase>
  );
}

export interface DropdownMenuSubContentProps {
  children: ReactNode;
  className?: string;
  /** Gap between the menu's edge and the submenu in px. Default 6. */
  sideOffset?: number;
}

export function DropdownMenuSubContent({ children, className, sideOffset = 6 }: DropdownMenuSubContentProps) {
  const root = useRoot("DropdownMenuSubContent");
  const level = useLevel("DropdownMenuSubContent");
  const sub = useSub("DropdownMenuSubContent");

  return (
    <AnimatePresence>
      {sub.open && (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <MenuPanel
              id={sub.contentId}
              anchorRef={sub.triggerRef}
              panelRef={sub.panelRef}
              side="right"
              align="start"
              sideOffset={sideOffset}
              focus={sub.focus}
              present={isPresent}
              gate={gate}
              labelledBy={sub.id}
              onClose={() => root.setOpen(false)}
              onPointerEnter={() => {
                level.grace.current = null;
              }}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft") return false;
                event.preventDefault();
                sub.setOpen(false);
                sub.triggerRef.current?.focus({ preventScroll: true });
                return true;
              }}
              className={className}
            >
              {children}
            </MenuPanel>
          )}
        </PresenceGate>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Decoration                                                                 */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuLabelProps {
  children: ReactNode;
  inset?: boolean;
  className?: string;
}

export function DropdownMenuLabel({ children, inset, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-medium text-muted-foreground", inset && "pl-9", className)}>
      {children}
    </div>
  );
}

export interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <hr className={cn("-mx-2 my-1 h-px border-0 bg-border", className)} />;
}

export interface DropdownMenuShortcutProps {
  children: ReactNode;
  className?: string;
}

export function DropdownMenuShortcut({ children, className }: DropdownMenuShortcutProps) {
  return (
    <span aria-hidden="true" className={cn("ml-auto pl-4 text-xs tracking-wide text-muted-foreground", className)}>
      {children}
    </span>
  );
}
