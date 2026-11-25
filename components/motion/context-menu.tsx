"use client";

import { Check } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
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
import { MENU_ITEM_CLASS, MenuItemHighlight } from "@/components/motion/menu/menu-item-highlight";
import { enabledItems, useMenuNavigation } from "@/components/motion/menu/use-menu-navigation";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { type DismissReason, useDismiss } from "@/lib/hooks/use-dismiss";
import { useMessages } from "@/lib/i18n";
import { assignRef } from "@/lib/merge-refs";
import { PresenceGate, type PresenceGateRenderProps } from "@/lib/presence-gate";
import { holdSelection, TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

type OpenModality = "pointer" | "keyboard" | "touch";
type MenuPoint = { x: number; y: number };

const VIEWPORT_PADDING = 8;
const LONG_PRESS_DELAY = 520;
const LONG_PRESS_TOLERANCE = 10;
const MORPH_DURATION = 0.3;
const EXIT_DURATION = 0.2;

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const contextMenuMessages = {
  label: "Context menu",
};

export type ContextMenuMessages = typeof contextMenuMessages;

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openAt: (point: MenuPoint, modality: OpenModality) => void;
  point: MenuPoint;
  modality: OpenModality;
  menuId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  /** The highlight glides after the pointer, and jumps after a key. */
  glide: boolean;
  setGlide: (glide: boolean) => void;
  /** Close from a key press (Escape, Tab): no exit animation. */
  closeFromKey: () => void;
  reduce: boolean;
  t: (key: keyof ContextMenuMessages) => string;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string) {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within <ContextMenu>`);
  }
  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function collapsedClip(
  origin: MenuPoint,
  size: { width: number; height: number },
) {
  const half = 8;
  const top = clamp(origin.y - half, 0, size.height);
  const right = clamp(size.width - origin.x - half, 0, size.width);
  const bottom = clamp(size.height - origin.y - half, 0, size.height);
  const left = clamp(origin.x - half, 0, size.width);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 10px)`;
}

export interface ContextMenuProps {
  children: ReactNode;
  /** Whether the menu is open, for controlled use. */
  open?: boolean;
  /** Whether the menu starts open when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the new open state when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Override any built-in string. */
  labels?: Partial<ContextMenuMessages>;
  /** Classes merged onto the wrapper around the trigger and menu. */
  className?: string;
}

export function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  labels,
  className,
}: ContextMenuProps) {
  const t = useMessages("contextMenu", contextMenuMessages, labels);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [point, setPoint] = useState<MenuPoint>({ x: 0, y: 0 });
  const [modality, setModality] = useState<OpenModality>("pointer");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [glide, setGlide] = useState(true);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const reduce = useReducedMotion() ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) setActiveId(null);
    },
    [controlled, onOpenChange],
  );

  const openAt = useCallback(
    (nextPoint: MenuPoint, nextModality: OpenModality) => {
      setPoint(nextPoint);
      setModality(nextModality);
      setGlide(nextModality !== "keyboard");
      setActiveId(null);
      setOpen(true);
    },
    [setOpen],
  );

  // The exit times itself by modality, so a key press closes without one.
  const closeFromKey = useCallback(() => {
    setModality("keyboard");
    setOpen(false);
  }, [setOpen]);

  // A focused panel answers Escape itself; this covers a menu opened by
  // pointer that never took focus. Either way focus goes back to the trigger.
  const dismiss = useCallback(
    (reason: DismissReason) => {
      if (reason === "escape") {
        closeFromKey();
        triggerRef.current?.focus();
      } else setOpen(false);
    },
    [setOpen, closeFromKey],
  );
  useDismiss(open, dismiss, contentRef);

  useEffect(() => {
    if (!open) return;
    const onWindowChange = () => setOpen(false);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange);
    };
  }, [open, setOpen]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      open,
      setOpen,
      openAt,
      point,
      modality,
      menuId,
      triggerRef,
      contentRef,
      activeId,
      setActiveId,
      glide,
      setGlide,
      closeFromKey,
      reduce,
      t,
    }),
    [
      open,
      setOpen,
      openAt,
      point,
      modality,
      menuId,
      activeId,
      glide,
      closeFromKey,
      reduce,
      t,
    ],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <div className={cn("contents", className)}>{children}</div>
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps {
  children: ReactElement<TriggerElementProps>;
  /** Stops right-click, long press and the keyboard from opening the menu. Default: false */
  disabled?: boolean;
  /** Classes merged onto the child element. */
  className?: string;
}

export function ContextMenuTrigger({
  children,
  disabled = false,
  className,
}: ContextMenuTriggerProps) {
  const context = useContextMenuContext("ContextMenuTrigger");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchOrigin = useRef<MenuPoint | null>(null);
  const releaseSelection = useRef<(() => void) | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchOrigin.current = null;
  }, []);

  // Held for the whole press, not just the timer: a gesture that turned into a
  // drag must not paint a selection under the finger either.
  const endPress = useCallback(() => {
    cancelLongPress();
    releaseSelection.current?.();
    releaseSelection.current = null;
  }, [cancelLongPress]);

  useEffect(() => endPress, [endPress]);

  if (!isValidElement(children)) {
    throw new Error("<ContextMenuTrigger> requires a single React element");
  }

  const childProps = children.props;
  const childRef = children.props.ref;

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    childProps.onPointerDown?.(event);
    // A pen presses the same way a finger does and gets no `contextmenu` out
    // of the platform for it, so it holds to open too. A mouse has the right
    // button and is left to `onContextMenu`.
    const pressToOpen =
      event.pointerType === "touch" || event.pointerType === "pen";
    if (event.defaultPrevented || disabled || !pressToOpen) return;

    // `pointer-coarse:select-none` misses this press on a laptop whose mouse
    // is the primary pointer and whose touchscreen is not, and the platform's
    // own long-press selection then claims the gesture and cancels ours. The
    // press is the only thing that knows which input is on the glass, so it
    // takes selection away itself — for its own duration, and no longer.
    releaseSelection.current?.();
    releaseSelection.current = holdSelection(event.currentTarget);

    const origin = { x: event.clientX, y: event.clientY };
    touchOrigin.current = origin;
    longPressTimer.current = setTimeout(() => {
      context.openAt(origin, "touch");
      longPressTimer.current = null;
      touchOrigin.current = null;
    }, LONG_PRESS_DELAY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    childProps.onPointerMove?.(event);
    const origin = touchOrigin.current;
    if (
      origin &&
      Math.hypot(event.clientX - origin.x, event.clientY - origin.y) >
        LONG_PRESS_TOLERANCE
    ) {
      cancelLongPress();
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    childProps.onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))
      return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    context.openAt(
      { x: rect.left + Math.min(24, rect.width / 2), y: rect.top + rect.height / 2 },
      "keyboard",
    );
  };

  return cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      context.triggerRef.current = node;
      assignRef(childRef, node);
    },
    "aria-controls": context.open ? context.menuId : undefined,
    "aria-haspopup": "menu",
    "aria-expanded": context.open,
    // The long press is ours: without this iOS runs its own on the same
    // gesture and drops the selection callout and its handles on top of the
    // menu we just opened. Only the press gesture is ours though — the child
    // is the consumer's content, so a mouse can still select the text in it
    // and right-click the selection. `touch-none` stays off too: the page
    // still has to scroll from the trigger.
    className: cn(TOUCH_GESTURE_CONTENT_CLASS, childProps.className, className),
    onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
      childProps.onContextMenu?.(event);
      if (event.defaultPrevented || disabled) return;
      event.preventDefault();
      endPress();
      context.openAt({ x: event.clientX, y: event.clientY }, "pointer");
    },
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
      childProps.onPointerUp?.(event);
      endPress();
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
      childProps.onPointerCancel?.(event);
      endPress();
    },
  });
}

export interface ContextMenuContentProps {
  children: ReactNode;
  /** Classes merged onto the menu panel. */
  className?: string;
  /** Accessible name for the menu. Default: "Context menu" */
  ariaLabel?: string;
}

export function ContextMenuContent({
  children,
  className,
  ariaLabel,
}: ContextMenuContentProps) {
  const context = useContextMenuContext("ContextMenuContent");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Mounted only while open: a closed menu leaves nothing on the page.
  return createPortal(
    <AnimatePresence>
      {context.open && (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <ContextMenuPanel
              present={isPresent}
              gate={gate}
              ariaLabel={ariaLabel}
              className={className}
            >
              {children}
            </ContextMenuPanel>
          )}
        </PresenceGate>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ContextMenuPanel({
  children,
  className,
  ariaLabel,
  present,
  gate,
}: ContextMenuContentProps & {
  present: boolean;
  gate: PresenceGateRenderProps["gate"];
}) {
  const context = useContextMenuContext("ContextMenuContent");
  const { point, modality, reduce, contentRef } = context;
  const [position, setPosition] = useState<MenuPoint>(point);
  const [origin, setOrigin] = useState<MenuPoint>({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [morphReady, setMorphReady] = useState(false);
  const navigate = useMenuNavigation();
  const instant = reduce || modality === "keyboard";

  // Runs again for a new invocation, and when the menu reopens during its exit.
  useLayoutEffect(() => {
    if (!present) return;
    const content = contentRef.current;
    if (!content) return;

    const rect = content.getBoundingClientRect();
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(point.x, VIEWPORT_PADDING),
        window.innerWidth - rect.width - VIEWPORT_PADDING,
      ),
    );
    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(point.y, VIEWPORT_PADDING),
        window.innerHeight - rect.height - VIEWPORT_PADDING,
      ),
    );

    setPosition({ x: left, y: top });
    setSize({ width: rect.width, height: rect.height });
    setOrigin({
      x: clamp(point.x - left, 12, Math.max(12, rect.width - 12)),
      y: clamp(point.y - top, 12, Math.max(12, rect.height - 12)),
    });
    setMorphReady(false);

    if (instant) {
      setMorphReady(true);
      return;
    }

    // Let the measured collapsed clip paint once before expanding it. Without
    // this preparation frame, the first invocation can batch both states and
    // appear at full size without the morph.
    let openFrame = 0;
    const prepareFrame = requestAnimationFrame(() => {
      openFrame = requestAnimationFrame(() => setMorphReady(true));
    });
    return () => {
      cancelAnimationFrame(prepareFrame);
      cancelAnimationFrame(openFrame);
    };
    // Every invocation sets a new `point` object, even at the same spot.
  }, [present, point, instant, contentRef]);

  useEffect(() => {
    if (!present) return;
    const frame = requestAnimationFrame(() => {
      const first = enabledItems(contentRef.current)[0];
      first?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [present, contentRef]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Set before the key moves focus, so the highlight it lands on jumps.
    context.setGlide(false);
    if (event.key === "Escape") {
      event.preventDefault();
      context.closeFromKey();
      context.triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      context.closeFromKey();
      return;
    }
    navigate(event, contentRef.current);
  };

  const clipHidden = collapsedClip(origin, size);
  const clipShown = "inset(0px 0px 0px 0px round 12px)";
  const timing = (duration: number) =>
    modality === "keyboard"
      ? { duration: 0 }
      : reduce
        ? { duration: 0.1, ease: EASE_OUT }
        : { duration, ease: EASE_OUT };

  return (
    <div
      {...gate}
      data-context-menu-portal=""
      style={{ ...gate.style, left: position.x, top: position.y }}
      className="fixed z-[100] [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.2))]"
    >
      <motion.div
        ref={contentRef}
        id={context.menuId}
        data-level={context.menuId}
        role="menu"
        aria-label={ariaLabel ?? context.t("label")}
        data-morph-ready={morphReady ? "true" : "false"}
        tabIndex={-1}
        initial={false}
        animate={{
          opacity: morphReady ? 1 : 0,
          clipPath: instant || morphReady ? clipShown : clipHidden,
        }}
        // Folds back into the point it opened from, faster than it grew.
        exit={{
          opacity: 0,
          clipPath: instant ? clipShown : clipHidden,
          transition: timing(EXIT_DURATION),
        }}
        transition={timing(MORPH_DURATION)}
        onKeyDown={onKeyDown}
        onPointerMove={(event) => {
          if (event.pointerType !== "touch") context.setGlide(true);
        }}
        onContextMenu={(event) => event.preventDefault()}
        className={cn(
          "min-w-56 overflow-hidden rounded-2xl border border-border bg-card p-2 text-foreground outline-none",
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

type ContextMenuItemTone = "default" | "destructive";

export interface ContextMenuItemProps {
  children: ReactNode;
  /** Called when the item is clicked or chosen with the keyboard. */
  onSelect?: () => void;
  /** Dims the item and skips it in keyboard navigation. Default: false */
  disabled?: boolean;
  /** Closes the menu after the item is chosen. Default: true */
  closeOnSelect?: boolean;
  /** Colors the item red for destructive actions. Default: "default" */
  tone?: ContextMenuItemTone;
  /** Adds left padding so the text lines up with items that have an icon. Default: false */
  inset?: boolean;
  /** Classes merged onto the item button. */
  className?: string;
  /** Text matched by typeahead, when the item's own text is not plain. */
  textValue?: string;
}

function ContextMenuItemBase({
  children,
  onSelect,
  disabled = false,
  closeOnSelect = true,
  tone = "default",
  inset = false,
  className,
  textValue,
  role = "menuitem",
  ariaChecked,
}: ContextMenuItemProps & {
  role?: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  ariaChecked?: boolean;
}) {
  const context = useContextMenuContext("ContextMenuItem");
  const id = useId();
  const active = context.activeId === id;
  const checkedProps =
    role === "menuitem" ? {} : { "aria-checked": ariaChecked };

  return (
    <button
      type="button"
      id={id}
      role={role}
      {...checkedProps}
      disabled={disabled}
      data-menu-item=""
      data-level={context.menuId}
      data-disabled={disabled ? "" : undefined}
      data-text-value={textValue}
      tabIndex={-1}
      onFocus={() => context.setActiveId(id)}
      onPointerMove={(event) => {
        if (!disabled && event.pointerType !== "touch") event.currentTarget.focus();
      }}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        if (closeOnSelect) context.setOpen(false);
      }}
      className={cn(
        MENU_ITEM_CLASS,
        "gap-2.5",
        "focus-visible:ring-2 focus-visible:ring-foreground/15",
        "disabled:pointer-events-none disabled:opacity-40",
        inset && "pl-9",
        tone === "destructive" ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {active ? (
        <MenuItemHighlight
          layoutId={`${context.menuId}-active`}
          tone={tone}
          reduce={context.reduce}
          instant={!context.glide}
        />
      ) : null}
      {children}
    </button>
  );
}

export function ContextMenuItem(props: ContextMenuItemProps) {
  return <ContextMenuItemBase {...props} />;
}

export interface ContextMenuCheckboxItemProps
  extends Omit<ContextMenuItemProps, "onSelect"> {
  /** Whether the item shows its check mark. */
  checked: boolean;
  /** Called with the new checked state when the item is chosen. */
  onCheckedChange?: (checked: boolean) => void;
}

export function ContextMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const context = useContextMenuContext("ContextMenuCheckboxItem");
  return (
    <ContextMenuItemBase
      {...props}
      role="menuitemcheckbox"
      ariaChecked={checked}
      onSelect={() => onCheckedChange?.(!checked)}
    >
      {children}
      {/* The mark sits at the end of the row, never before the label. */}
      <span aria-hidden="true" className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false}>
          {checked ? (
            <motion.span
              key="check"
              initial={context.reduce ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: context.reduce ? 1 : 0.75 }}
              transition={context.reduce ? { duration: 0.08 } : SPRING_PANEL}
            >
              <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </ContextMenuItemBase>
  );
}

interface ContextMenuRadioGroupContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const ContextMenuRadioGroupContext =
  createContext<ContextMenuRadioGroupContextValue | null>(null);

export interface ContextMenuRadioGroupProps {
  /** The value of the checked radio item. */
  value: string;
  /** Called with the item's value when a radio item is chosen. */
  onValueChange?: (value: string) => void;
  children: ReactNode;
  /** Classes merged onto the group element. */
  className?: string;
}

export function ContextMenuRadioGroup({
  value,
  onValueChange,
  children,
  className,
}: ContextMenuRadioGroupProps) {
  const context = useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange],
  );
  return (
    <ContextMenuRadioGroupContext.Provider value={context}>
      <div className={className}>{children}</div>
    </ContextMenuRadioGroupContext.Provider>
  );
}

export interface ContextMenuRadioItemProps
  extends Omit<ContextMenuItemProps, "onSelect"> {
  /** The value this item sets on its radio group. */
  value: string;
}

export function ContextMenuRadioItem({
  value,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  const group = useContext(ContextMenuRadioGroupContext);
  if (!group) {
    throw new Error(
      "ContextMenuRadioItem must be used within <ContextMenuRadioGroup>",
    );
  }
  const checked = group.value === value;
  return (
    <ContextMenuItemBase
      {...props}
      role="menuitemradio"
      ariaChecked={checked}
      onSelect={() => group.onValueChange?.(value)}
    >
      {children}
      {/* The mark sits at the end of the row, never before the label. */}
      <span aria-hidden="true" className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center">
        <Check
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
          strokeWidth={2.4}
        />
      </span>
    </ContextMenuItemBase>
  );
}

export interface ContextMenuLabelProps {
  children: ReactNode;
  /** Adds left padding to line up with inset items. Default: false */
  inset?: boolean;
  /** Classes merged onto the label element. */
  className?: string;
}

export function ContextMenuLabel({
  children,
  inset = false,
  className,
}: ContextMenuLabelProps) {
  return (
    <div
      className={cn(
        "px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
        inset && "pl-9",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ContextMenuSeparatorProps {
  /** Classes merged onto the separator line. */
  className?: string;
}

export function ContextMenuSeparator({
  className,
}: ContextMenuSeparatorProps) {
  return (
    <hr className={cn("-mx-2 my-1 h-px border-0 bg-border", className)} />
  );
}

export interface ContextMenuShortcutProps {
  children: ReactNode;
  /** Classes merged onto the shortcut text. */
  className?: string;
}

export function ContextMenuShortcut({
  children,
  className,
}: ContextMenuShortcutProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-auto pl-4 text-[11px] font-medium tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
