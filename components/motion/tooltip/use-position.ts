"use client";

import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
  type VirtualElement,
} from "@floating-ui/dom";
import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipPoint = { x: number; y: number };

/** Position is geometry, not animation. One write per frame, never a spring chasing a pointer. */
export function useTooltipPosition({
  open,
  anchorRef,
  floatingRef,
  anchorPoint,
  followCursor,
  side,
  onDismiss,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | SVGElement | null>;
  floatingRef: RefObject<HTMLSpanElement | null>;
  anchorPoint?: TooltipPoint;
  followCursor: boolean;
  side: TooltipSide;
  onDismiss: () => void;
}) {
  const cursor = useRef<TooltipPoint | null>(null);
  const cursorSide = useRef<Placement | null>(null);
  useLayoutEffect(() => {
    cursorSide.current = open ? side : null;
  }, [open, side]);
  const pointerFocus = useRef(false);
  const frame = useRef<number | null>(null);
  const version = useRef(0);
  const update = useRef<() => void>(() => {});
  const schedule = useCallback(() => {
    // Invalidate older async calculations as soon as new geometry is requested.
    version.current++;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      update.current();
    });
  }, []);
  const pointX = anchorPoint?.x;
  const pointY = anchorPoint?.y;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !followCursor) return;
    const point = (event: PointerEvent) => {
      if (event.type === "pointermove" && event.pointerType === "touch" && !event.buttons) return;
      cursor.current = { x: event.clientX, y: event.clientY };
      if (event.type === "pointerdown") pointerFocus.current = true;
      schedule();
    };
    const keyboard = () => {
      cursor.current = null;
      pointerFocus.current = false;
      schedule();
    };
    const focus = () => {
      if (!pointerFocus.current) cursor.current = null;
      pointerFocus.current = false;
      schedule();
    };
    const leave = () => {
      cursor.current = null;
    };
    anchor.addEventListener("pointerenter", point as EventListener, { passive: true });
    anchor.addEventListener("pointermove", point as EventListener, { passive: true });
    anchor.addEventListener("pointerdown", point as EventListener, { passive: true });
    anchor.addEventListener("pointerleave", leave);
    anchor.addEventListener("pointercancel", leave);
    anchor.addEventListener("keydown", keyboard);
    anchor.addEventListener("focusin", focus);
    return () => {
      cursor.current = null;
      anchor.removeEventListener("pointerenter", point as EventListener);
      anchor.removeEventListener("pointermove", point as EventListener);
      anchor.removeEventListener("pointerdown", point as EventListener);
      anchor.removeEventListener("pointerleave", leave);
      anchor.removeEventListener("pointercancel", leave);
      anchor.removeEventListener("keydown", keyboard);
      anchor.removeEventListener("focusin", focus);
    };
  }, [anchorRef, followCursor, schedule]);

  // Latest committed inputs are read without recreating observers for every period/content update.
  useLayoutEffect(() => {
    update.current = () => {
      const anchor = anchorRef.current;
      const floating = floatingRef.current;
      if (!open || !anchor || !floating) return;
      const revision = ++version.current;
      const currentCursor = followCursor ? cursor.current : null;
      const reference: Element | VirtualElement =
        currentCursor || pointX !== undefined || pointY !== undefined
          ? {
              contextElement: anchor,
              getBoundingClientRect: () => {
                const rect = anchor.getBoundingClientRect();
                const x = currentCursor?.x ?? rect.left + rect.width * (pointX ?? 0.5);
                const y = currentCursor?.y ?? rect.top + rect.height * (pointY ?? 0.5);
                return { x, y, left: x, right: x, top: y, bottom: y, width: 0, height: 0 };
              },
            }
          : anchor;
      void computePosition(reference, floating, {
        strategy: "fixed",
        placement: currentCursor ? (cursorSide.current ?? side) : side,
        middleware: [offset(currentCursor ? 12 : 8), flip({ padding: 8 }), shift({ padding: 8 })],
      }).then(({ x, y, placement }) => {
        if (version.current !== revision || !floating.isConnected) return;
        // Hold the chosen side for this hover session. Crossing a flip threshold
        // repeatedly must not bounce the surface above and below the pointer.
        if (currentCursor) cursorSide.current = placement;
        else cursorSide.current = null;
        const dpr = window.devicePixelRatio || 1;
        floating.style.transform = `translate3d(${Math.round(x * dpr) / dpr}px, ${Math.round(y * dpr) / dpr}px, 0)`;
        floating.style.visibility = "visible";
        floating.dataset.placement = placement;
      });
    };
    if (open) schedule();
  }, [open, anchorRef, floatingRef, followCursor, pointX, pointY, side, schedule]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!open || !anchor || !floating) return;
    const stop = autoUpdate(anchor, floating, schedule);
    const onScroll = () => {
      // A stationary pointer no longer describes the same chart point after scrolling.
      if (followCursor && cursor.current) onDismiss();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => {
      stop();
      window.removeEventListener("scroll", onScroll, true);
      version.current++;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [open, anchorRef, floatingRef, followCursor, onDismiss, schedule]);

  useLayoutEffect(
    () => () => {
      version.current++;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
}
