"use client";

import { type MutableRefObject, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useId } from "react";
import { MENU_ITEM_CLASS, MenuItemHighlight } from "@/components/motion/menu/menu-item-highlight";
import { cn } from "@/lib/utils";
import { useLevel, useRoot } from "./context";
import { insidePolygon } from "./placement";

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

/** The row every item kind renders: plain, checkbox, radio and submenu trigger. */
export function ItemBase({
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
      onClick={(event) => {
        if (disabled) return;
        if (subTrigger) {
          subTrigger.onClick();
          return;
        }
        onSelect?.();
        // `detail` is 0 when Enter or Space picked the row: close without animating.
        if (closeOnSelect) root.setOpen(false, "first", event.detail === 0);
      }}
      className={cn(
        MENU_ITEM_CLASS,
        "cursor-default gap-2",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        inset && "pl-9",
        disabled && "opacity-50",
        tone === "destructive" ? "text-destructive [&_svg]:text-destructive" : "[&_svg]:text-muted-foreground",
        className,
      )}
    >
      {active && !disabled ? (
        <MenuItemHighlight
          layoutId={`${level.levelId}-highlight`}
          tone={tone}
          reduce={root.reduce}
          instant={!level.glide}
        />
      ) : null}
      {children}
    </button>
  );
}
