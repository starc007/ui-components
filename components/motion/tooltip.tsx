"use client";

import { AnimatePresence } from "motion/react";
import { PresenceGate } from "@/lib/presence-gate";
import { useTooltipPosition } from "./tooltip/use-position";
import {
  cloneElement,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TooltipSurface } from "@/components/motion/tooltip-surface";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverGesture } from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  children?: ReactElement;
  /** Existing trigger for controlled integrations such as chart cells. */
  anchorRef?: RefObject<HTMLElement | SVGElement | null>;
  /** Point within the anchor, as fractions of its rendered width and height. */
  anchorPoint?: { x: number; y: number };
  /** Follow real pointer coordinates; keyboard focus still uses the anchor. */
  followCursor?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  side?: Side;
  /** Delay before showing (ms). Default 120. */
  delay?: number;
  className?: string;
  /** Classes for the outer wrapper span. Use to fix baseline / fill parent. */
  wrapperClassName?: string;
}

// Once any tooltip has just closed, neighbouring tooltips open without the
// initial delay — moving along a toolbar feels instant after the first one.
const WARM_WINDOW_MS = 300;
let lastHiddenAt = 0;

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 120,
  className,
  wrapperClassName,
  anchorRef: externalAnchorRef,
  anchorPoint,
  followCursor = false,
  open: controlledOpen,
  onOpenChange,
  id: providedId,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const anchorRef = externalAnchorRef ?? wrapperRef;
  const hover = useHoverGesture();
  const floatingRef = useRef<HTMLSpanElement>(null);
  const focused = useRef(false);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (open) return;
    const warm = Date.now() - lastHiddenAt < WARM_WINDOW_MS;
    timer.current = setTimeout(
      () => {
        setOpen(true);
      },
      warm ? 0 : delay,
    );
  }, [delay, setOpen, open]);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (open) lastHiddenAt = Date.now();
    setOpen(false);
  }, [open, setOpen]);

  const leave = useCallback(() => {
    if (focused.current) return;
    if (timer.current) clearTimeout(timer.current);
    // Bridge the small physical gap to a stationary, readable tooltip.
    if (followCursor) hide();
    else timer.current = setTimeout(hide, 100);
  }, [followCursor, hide]);
  const insideTooltip = useCallback(
    (target: Element) => Boolean(floatingRef.current?.contains(target)),
    [],
  );

  // A finger never hovers, and Safari does not focus a button on tap either, so
  // the label is only reachable if the tap itself opens the tooltip. A click
  // carries no pointerType, so the pointerdown that preceded it is what says
  // whether this was a tap; keyboard activation arrives with no pointerdown at
  // all, and focus has already shown the label there.
  const tap = useTapGesture<boolean>();

  const toggleOnTap = useCallback(() => {
    const gesture = tap.take();
    if (!gesture || gesture.pointerType === "mouse") return;
    if (gesture.state) {
      hide();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, [hide, tap, setOpen]);

  // ...and closed again by the next tap that lands somewhere else. The label
  // covers nothing interactive, so that tap passes through to what it hit.
  useDismiss(open, hide, anchorRef, { ignore: insideTooltip });

  useTooltipPosition({
    open,
    anchorRef,
    floatingRef,
    anchorPoint,
    followCursor,
    side,
    onDismiss: hide,
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!externalAnchorRef && !isValidElement(children)) return children;

  // The label describes the trigger, so it has to name the trigger itself.
  // Everything else the tooltip needs is read off the anchor below instead of
  // cloned on: a handler written onto the child is the child's handler as far
  // as that child can tell, and a component that owns its activation —
  // hard-wiring onClick and spreading the rest of its props over it, as
  // ThemeToggle does — then runs the tooltip's instead of its own. Composing
  // with `props.onClick` cannot save it either, because a component element's
  // props hold nothing the component does internally.
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby":
          [(children.props as Record<string, unknown>)["aria-describedby"], open ? id : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
      })
    : null;

  return (
    <>
      {!externalAnchorRef ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: This wrapper observes bubbling trigger events without replacing the control's handlers.
        <span
          ref={wrapperRef}
          className={cn("relative inline-flex align-middle", wrapperClassName)}
          // Pointer events, not the mouse pair: a tap fires compatibility
          // mouseenter/mouseleave that carry no pointerType, which raced the tap
          // path into opening and closing the same label.
          onPointerEnter={(event: PointerEvent) => {
            if (hover.enter(event)) show();
          }}
          onPointerLeave={(event: PointerEvent) => {
            if (hover.leave(event)) leave();
          }}
          onFocus={() => {
            focused.current = true;
            show();
          }}
          onBlur={() => {
            focused.current = false;
            hide();
          }}
          onPointerDown={(event: PointerEvent) => tap.start(event, open)}
          // A gesture the platform took away sends no click, and a key press
          // starts an activation that never had a pointer behind it. Either way
          // the record has to go, or the next click reads a finger that has long
          // since lifted.
          onPointerCancel={tap.drop}
          onKeyDown={(event) => {
            tap.drop();
            if (event.key === "Escape") hide();
          }}
          onClick={toggleOnTap}
        >
          {trigger}
        </span>
      ) : null}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <PresenceGate key="tooltip">
                  {({ isPresent }) => (
                    <span
                      ref={floatingRef}
                      inert={!isPresent}
                      aria-hidden={!isPresent || undefined}
                      className="pointer-events-none fixed left-0 top-0 z-[9999] w-max"
                      style={{ visibility: "hidden", maxWidth: "calc(100vw - 16px)" }}
                    >
                      <TooltipSurface
                        id={id}
                        side={side}
                        onPointerEnter={() => {
                          if (timer.current) clearTimeout(timer.current);
                        }}
                        onPointerLeave={leave}
                        style={{
                          maxWidth: "calc(100vw - 16px)",
                          whiteSpace: "normal",
                          pointerEvents: isPresent && !followCursor ? "auto" : "none",
                        }}
                        className={cn("overflow-hidden", className)}
                      >
                        {content}
                      </TooltipSurface>
                    </span>
                  )}
                </PresenceGate>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
