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
import { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";
import { holdSelection, TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

type OpenModality = "pointer" | "keyboard" | "touch";
type MenuPoint = { x: number; y: number };

const VIEWPORT_PADDING = 8;
const LONG_PRESS_DELAY = 520;
const LONG_PRESS_TOLERANCE = 10;
const MORPH_DURATION = 0.3;

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openAt: (point: MenuPoint, modality: OpenModality) => void;
  point: MenuPoint;
  modality: OpenModality;
  invocation: number;
  menuId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  reduce: boolean;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string) {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within <ContextMenu>`);
  }
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getEnabledItems(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-context-menu-item="true"]:not([data-disabled="true"])',
    ),
  );
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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: ContextMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [point, setPoint] = useState<MenuPoint>({ x: 0, y: 0 });
  const [modality, setModality] = useState<OpenModality>("pointer");
  const [invocation, setInvocation] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
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
      setInvocation((current) => current + 1);
      setActiveId(null);
      setOpen(true);
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!contentRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onWindowChange = () => setOpen(false);

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
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
      invocation,
      menuId,
      triggerRef,
      contentRef,
      activeId,
      setActiveId,
      reduce,
    }),
    [
      open,
      setOpen,
      openAt,
      point,
      modality,
      invocation,
      menuId,
      activeId,
      reduce,
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
  disabled?: boolean;
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
  className?: string;
  ariaLabel?: string;
}

export function ContextMenuContent({
  children,
  className,
  ariaLabel = "Context menu",
}: ContextMenuContentProps) {
  const context = useContextMenuContext("ContextMenuContent");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPoint>(context.point);
  const [origin, setOrigin] = useState<MenuPoint>({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [morphReady, setMorphReady] = useState(false);
  const typeahead = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!context.open) {
      setMorphReady(false);
      return;
    }
    const content = context.contentRef.current;
    if (!content) return;
    content.dataset.invocation = String(context.invocation);

    const rect = content.getBoundingClientRect();
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(context.point.x, VIEWPORT_PADDING),
        window.innerWidth - rect.width - VIEWPORT_PADDING,
      ),
    );
    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(context.point.y, VIEWPORT_PADDING),
        window.innerHeight - rect.height - VIEWPORT_PADDING,
      ),
    );

    setPosition({ x: left, y: top });
    setSize({ width: rect.width, height: rect.height });
    setOrigin({
      x: clamp(context.point.x - left, 12, Math.max(12, rect.width - 12)),
      y: clamp(context.point.y - top, 12, Math.max(12, rect.height - 12)),
    });
    setMorphReady(false);

    if (context.reduce || context.modality === "keyboard") {
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
  }, [
    context.open,
    context.point,
    context.contentRef,
    context.invocation,
    context.modality,
    context.reduce,
  ]);

  useEffect(() => {
    if (!context.open) return;
    const frame = requestAnimationFrame(() => {
      const first = getEnabledItems(context.contentRef.current)[0];
      first?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [context.open, context.contentRef]);

  useEffect(
    () => () => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    },
    [],
  );

  const moveFocus = (direction: 1 | -1) => {
    const items = getEnabledItems(context.contentRef.current);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? 0 : (current + direction + items.length) % items.length;
    items[next]?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      context.setOpen(false);
      context.triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      context.setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const items = getEnabledItems(context.contentRef.current);
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
      return;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      typeahead.current += event.key.toLocaleLowerCase();
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        typeahead.current = "";
      }, 500);
      const match = getEnabledItems(context.contentRef.current).find((item) =>
        (item.dataset.label ?? item.textContent ?? "")
          .trim()
          .toLocaleLowerCase()
          .startsWith(typeahead.current),
      );
      match?.focus();
    }
  };

  if (!mounted) return null;

  const visualOpen = context.open && morphReady;
  const clipHidden = collapsedClip(origin, size);
  const clipShown = "inset(0px 0px 0px 0px round 12px)";

  return createPortal(
    <div
      data-context-menu-portal=""
      aria-hidden={!context.open}
      inert={!context.open}
      style={{ left: position.x, top: position.y }}
      className={cn(
        "fixed z-[100] [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.2))]",
        context.open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <motion.div
        ref={context.contentRef}
        id={context.menuId}
        role="menu"
        aria-label={ariaLabel}
        data-morph-ready={morphReady ? "true" : "false"}
        tabIndex={-1}
        initial={false}
        animate={{
          opacity: visualOpen ? 1 : 0,
          clipPath:
            context.reduce || context.modality === "keyboard" || visualOpen
              ? clipShown
              : clipHidden,
        }}
        transition={
          context.modality === "keyboard"
            ? { duration: 0 }
            : context.reduce
              ? { duration: 0.1, ease: EASE_OUT }
              : {
                  clipPath: {
                    duration: MORPH_DURATION,
                    ease: EASE_OUT,
                  },
                  opacity: {
                    duration: MORPH_DURATION,
                    ease: EASE_OUT,
                  },
                }
        }
        onKeyDown={onKeyDown}
        onContextMenu={(event) => event.preventDefault()}
        className={cn(
          "min-w-56 overflow-hidden rounded-xl border border-border bg-card p-1.5 text-foreground outline-none",
          className,
        )}
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  );
}

type ContextMenuItemTone = "default" | "destructive";

export interface ContextMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  tone?: ContextMenuItemTone;
  inset?: boolean;
  className?: string;
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
      data-context-menu-item="true"
      data-disabled={disabled ? "true" : undefined}
      data-label={textValue}
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
        "relative isolate flex w-full select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] outline-none",
        "focus-visible:ring-2 focus-visible:ring-foreground/15",
        "disabled:pointer-events-none disabled:opacity-40",
        inset && "pl-8",
        tone === "destructive" ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={`${context.menuId}-active`}
          className={cn(
            "absolute inset-0 -z-10 rounded-lg",
            tone === "destructive"
              ? "bg-destructive/10"
              : "bg-foreground/[0.065]",
          )}
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
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
  checked: boolean;
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
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
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
      {children}
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
  value: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
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
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      {children}
    </ContextMenuItemBase>
  );
}

export interface ContextMenuLabelProps {
  children: ReactNode;
  inset?: boolean;
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
        "px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
        inset && "pl-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ContextMenuSeparatorProps {
  className?: string;
}

export function ContextMenuSeparator({
  className,
}: ContextMenuSeparatorProps) {
  return (
    <hr className={cn("-mx-1 my-1 h-px border-0 bg-border", className)} />
  );
}

export interface ContextMenuShortcutProps {
  children: ReactNode;
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
        "ml-auto pl-4 text-[10px] font-medium tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
