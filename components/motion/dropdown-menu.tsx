"use client";

import { Check, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  useMemo,
  useRef,
  useState,
} from "react";
import { enabledItems } from "@/components/motion/menu/use-menu-navigation";
import { SPRING_PANEL } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { PresenceGate } from "@/lib/presence-gate";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { selectSound } from "@/lib/sounds/select";
import { assignRef } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";
import { type FocusTarget, RootContext, type RootContextValue, useLevel, useRoot } from "./dropdown-menu/context";
import { type DropdownMenuItemProps, ItemBase } from "./dropdown-menu/item-base";
import { MenuPanel } from "./dropdown-menu/menu-panel";
import type { Align } from "./dropdown-menu/placement";

export type { DropdownMenuItemProps } from "./dropdown-menu/item-base";

// Long enough to skip the submenus a pointer crosses on its way somewhere else.
const SUB_OPEN_DELAY = 100;
// How long a pointer heading for an open submenu may cross sibling rows.
const SUB_GRACE = 300;

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  "data-state"?: "open" | "closed";
};

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Play a soft sweep as the menu opens and closes, and a tick for checkbox
   * and radio rows. Off by default; a `SoundProvider` can mute it app-wide.
   */
  sound?: boolean;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  sound = false,
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
  const playOpen = useSound(openSound, { enabled: sound });
  const playClose = useSound(closeSound, { enabled: sound });
  const playSelect = useSound(selectSound, { enabled: sound });

  useEffect(() => setMounted(true), []);

  const setOpen = useCallback(
    (next: boolean, focus: FocusTarget = "first") => {
      if (next !== open) {
        if (next) playOpen();
        else playClose();
      }
      if (next) setFocusTarget(focus);
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange, open, playOpen, playClose],
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
      playSelect,
    }),
    [open, setOpen, focusTarget, menuId, triggerId, reduce, mounted, playSelect],
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
      onSelect={() => {
        if (!closeOnSelect) root.playSelect();
        onCheckedChange?.(!checked);
      }}
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
      onSelect={() => {
        // A pick that closes the menu sounds through the close sweep instead.
        if (!closeOnSelect && !checked) root.playSelect();
        group.onValueChange?.(value);
      }}
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
