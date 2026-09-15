"use client";

import { AnimatePresence } from "motion/react";
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
  useLayoutEffect,
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

// Gap between trigger and tooltip, in px.
const GAP = 8;

// Centering transform for the fixed-positioned anchor point, per side.
const anchorTransform: Record<Side, string> = {
  top: "translate(-50%, -100%)",
  bottom: "translate(-50%, 0)",
  left: "translate(-100%, -50%)",
  right: "translate(0, -50%)",
};

const transformOrigin: Record<Side, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const anchorRef = externalAnchorRef ?? wrapperRef;
  const hover = useHoverGesture();
  const surfaceRef = useRef<HTMLSpanElement>(null);

  // Anchor point in viewport coords, on the edge of the trigger facing `side`.
  // Position:fixed means these viewport coords place the tooltip directly, so
  // it escapes every ancestor's stacking context and overflow.
  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width * (anchorPoint?.x ?? 0.5);
    const cy = r.top + r.height * (anchorPoint?.y ?? 0.5);
    const point: Record<Side, { top: number; left: number }> = {
      top: { top: (anchorPoint ? cy : r.top) - GAP, left: cx },
      bottom: { top: (anchorPoint ? cy : r.bottom) + GAP, left: cx },
      left: { top: cy, left: (anchorPoint ? cx : r.left) - GAP },
      right: { top: cy, left: (anchorPoint ? cx : r.right) + GAP },
    };
    const next = point[side];
    const width = surfaceRef.current?.offsetWidth ?? 0;
    const height = surfaceRef.current?.offsetHeight ?? 0;
    const dx = side === "left" ? width : side === "right" ? 0 : width / 2;
    const dy = side === "top" ? height : side === "bottom" ? 0 : height / 2;
    next.left = Math.max(GAP + dx, Math.min(next.left, window.innerWidth - GAP - width + dx));
    next.top = Math.max(GAP + dy, Math.min(next.top, window.innerHeight - GAP - height + dy));
    setCoords(previous => previous?.top === next.top && previous.left === next.left ? previous : next);
  }, [side, anchorRef, anchorPoint]);

  const positioned = coords !== null;
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const observer = new ResizeObserver(place);
    if (anchorRef.current) observer.observe(anchorRef.current);
    if (positioned && surfaceRef.current) observer.observe(surfaceRef.current);
    return () => observer.disconnect();
  }, [open, place, anchorRef, positioned]);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    const warm = Date.now() - lastHiddenAt < WARM_WINDOW_MS;
    timer.current = setTimeout(
      () => {
        place();
        setOpen(true);
      },
      warm ? 0 : delay,
    );
  }, [delay, place, setOpen]);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (open) lastHiddenAt = Date.now();
    setOpen(false);
  }, [open, setOpen]);

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
    place();
    setOpen(true);
  }, [hide, place, tap, setOpen]);

  // ...and closed again by the next tap that lands somewhere else. The label
  // covers nothing interactive, so that tap passes through to what it hit.
  useDismiss(open, hide, anchorRef);

  // Keep the tooltip pinned to the trigger while it's open and the page scrolls
  // or resizes (fixed coords are viewport-relative).
  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

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
        "aria-describedby": id,
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
            if (hover.leave(event)) hide();
          }}
          onFocus={show}
          onBlur={hide}
          onPointerDown={(event: PointerEvent) => tap.start(event, open)}
          // A gesture the platform took away sends no click, and a key press
          // starts an activation that never had a pointer behind it. Either way
          // the record has to go, or the next click reads a finger that has long
          // since lifted.
          onPointerCancel={tap.drop}
          onKeyDown={tap.drop}
          onClick={toggleOnTap}
        >
          {trigger}
        </span>
      ) : null}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open && coords ? (
                <span
                  className="pointer-events-none fixed z-[9999]"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    transform: anchorTransform[side],
                  }}
                >
                  <TooltipSurface
                    ref={surfaceRef}
                    id={id}
                    side={side}
                    style={{ transformOrigin: transformOrigin[side], maxWidth: "calc(100vw - 16px)", whiteSpace: "normal" }}
                    className={className}
                  >
                    {content}
                  </TooltipSurface>
                </span>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
