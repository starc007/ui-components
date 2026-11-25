"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import { type PointerEvent, type ReactNode, useRef } from "react";
import { EASE_DRAWER, EASE_OUT } from "@/lib/ease";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useMessages } from "@/lib/i18n";
import { PresenceGate } from "@/lib/presence-gate";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

// The iOS sheet curve: one clean deceleration in, and a shorter one out, so
// the panel leaves faster than it arrives.
const SLIDE_IN = { duration: 0.45, ease: EASE_DRAWER } as const;
const SLIDE_OUT = { duration: 0.3, ease: EASE_DRAWER } as const;
// A flick this fast (px/s) toward the edge closes it, however short.
const FLING = 500;
// Or a drag past this share of the panel's width.
const DISMISS_SHARE = 0.35;
// A swipe never starts on something the finger is using.
const NO_DRAG = "input, textarea, select, [contenteditable='true'], [role='slider'], [data-drawer-no-drag]";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const drawerMessages = {
  close: "Close",
};

export type DrawerMessages = typeof drawerMessages;

export interface DrawerProps {
  /** Whether the drawer is shown. */
  open: boolean;
  /** Called with false when the backdrop, Escape or a swipe closes the drawer. */
  onOpenChange: (open: boolean) => void;
  /** Edge of the viewport the panel slides in from. Default: "right" */
  side?: "left" | "right";
  children: ReactNode;
  /** Class for the panel surface. */
  className?: string;
  /** Class for the backdrop. */
  backdropClassName?: string;
  /** Accessible name for the dialog panel. */
  ariaLabel?: string;
  /**
   * Close when the backdrop is clicked, Escape is pressed, or the panel is
   * swiped toward its edge. Default true. Mark content that must keep its own
   * horizontal gestures with `data-drawer-no-drag`.
   */
  dismissable?: boolean;
  /** Override any built-in string. */
  labels?: Partial<DrawerMessages>;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  backdropClassName,
  ariaLabel,
  dismissable = true,
  labels,
}: DrawerProps) {
  const t = useMessages("drawer", drawerMessages, labels);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Focus moves into the panel on open, Tab stays inside it, and focus returns
  // to the opener on close.
  useFocusTrap(open, panelRef, {
    onEscape: dismissable ? () => onOpenChange(false) : undefined,
  });

  useScrollLock(open);

  const offscreen = side === "right" ? "100%" : "-100%";
  // Positive means toward the edge the drawer leaves by.
  const toward = side === "right" ? 1 : -1;

  // Only a finger or pen swipes the panel shut; a mouse drag over it selects
  // text, as it should on a desktop.
  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (!dismissable || event.pointerType === "mouse") return;
    if ((event.target as Element).closest(NO_DRAG)) return;
    dragControls.start(event);
  };

  const endSwipe = (_: unknown, info: PanInfo) => {
    const distance = info.offset.x * toward;
    const speed = info.velocity.x * toward;
    const width = panelRef.current?.offsetWidth ?? 320;
    // A quick flick is enough; a slow drag has to go a third of the way.
    if (speed > FLING || distance > width * DISMISS_SHARE) onOpenChange(false);
  };

  // Two fixed siblings, no wrapper: the backdrop spans the viewport edges but
  // paints the scrim, and the panel is inset off one side and paints its own
  // surface, so neither is a transparent edge-spanning layer. Both hang off
  // `PresenceGate`, so interaction releases in the same commit that starts the
  // exit rather than when it ends.
  return (
    <AnimatePresence>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label={t("close")}
              // Outside the panel, so the focus trap never lands on it; it is
              // a pointer target only.
              tabIndex={-1}
              onClick={() => dismissable && onOpenChange(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // The scrim clears faster than it settles, like the panel.
              exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              {...gate}
              className={cn(
                "fixed inset-0 z-50 h-full w-full cursor-default bg-black/40 backdrop-blur-sm",
                backdropClassName,
              )}
            />
          )}
        </PresenceGate>
      ) : null}
      {open ? (
        <PresenceGate key="panel">
          {({ gate }) => (
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              initial={reduce ? { opacity: 0 } : { x: offscreen }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } }
                  : { x: offscreen, transition: SLIDE_OUT }
              }
              transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SLIDE_IN}
              // Swipe toward the edge to close. Toward the page it meets
              // friction instead of a wall, and a short swipe springs back.
              drag="x"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={side === "right" ? { left: 0.04, right: 1 } : { left: 1, right: 0.04 }}
              dragMomentum={false}
              onPointerDown={startSwipe}
              onDragEnd={endSwipe}
              {...gate}
              className={cn(
                // Vertical scrolling stays native; only a sideways swipe drags.
                "fixed inset-y-0 z-50 flex w-80 max-w-[85vw] touch-pan-y flex-col bg-background shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)] outline-none",
                // Only the corners facing the page are rounded; the edge
                // against the viewport stays square.
                side === "right"
                  ? "right-0 rounded-l-2xl border-l border-border"
                  : "left-0 rounded-r-2xl border-r border-border",
                className,
              )}
            >
              {children}
            </motion.div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>
  );
}
