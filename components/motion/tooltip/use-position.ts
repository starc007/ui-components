"use client";

import {
  arrow as arrowMiddleware,
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  type Placement,
  shift,
  type VirtualElement,
} from "@floating-ui/dom";
import { type RefObject, useCallback, useLayoutEffect, useMemo, useRef } from "react";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";
export type TooltipPoint = {
  /** Horizontal position; for `anchorPoint`, a 0 to 1 fraction of the anchor's width. */
  x: number;
  /** Vertical position; for `anchorPoint`, a 0 to 1 fraction of the anchor's height. */
  y: number;
};
export type TooltipAnchor = HTMLElement | SVGElement;

const ORIGIN: Record<TooltipSide, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

/** `top` painted over `bottom`, as one opaque colour. Falls back to `top`. */
function blend(top: string, bottom: string) {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return top;
  context.fillStyle = bottom;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = top;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  // A see-through background has nothing solid to blend onto.
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : top;
}

/** The arrow element's box, which the arrow middleware centres along the edge. */
const ARROW_SIZE = 12;
/** How far the tip reaches past the border's inner edge. */
const ARROW_REACH = 6;

/**
 * How far a rounded edge has curved in from its straight line at `position`
 * along an edge of `length`, with corners of `radius`. Zero on the straight
 * stretch between the corners.
 */
function curveDepth(position: number, length: number, radius: number) {
  const offset =
    position < radius ? radius - position : position > length - radius ? position - (length - radius) : 0;
  if (offset <= 0) return 0;
  return radius - Math.sqrt(Math.max(radius * radius - offset * offset, 0));
}

/**
 * The arrow's two paths, in the surface's border-box coordinates. Each 45°
 * side runs from the tip until it meets the middle of the surface's border,
 * wherever that is: on a straight stretch, or partway round a pill's curved
 * end. The stroke covers only those two sides, so the border flows straight
 * into them. The fill closes a little inside the surface, hiding the stretch
 * of border the arrow sits on.
 */
function arrowShape({
  side,
  center,
  width,
  height,
  radius,
  border,
}: {
  side: TooltipSide;
  center: number;
  width: number;
  height: number;
  radius: number;
  border: number;
}) {
  const vertical = side === "top" || side === "bottom";
  const length = vertical ? width : height;
  // Work on one edge: `depth` runs inward from the edge's outer line, `along` runs down it.
  const tip = { depth: border - ARROW_REACH, along: center };
  // The border's centre line: the stroke meets it there, so the two line up.
  const line = border / 2;
  // Both sides follow the same rule, so an arrow a pixel off-centre stays symmetric.
  const curved =
    curveDepth(center - ARROW_SIZE / 2, length, radius) > 0 ||
    curveDepth(center + ARROW_SIZE / 2, length, radius) > 0;
  const meet = (direction: -1 | 1) => {
    // On a straight stretch the 45° side meets the border directly.
    if (!curved) {
      for (let t = 0; t <= ARROW_SIZE; t += 0.05) {
        const along = center + direction * t;
        const depth = tip.depth + t;
        if (depth >= line) return { depth, along };
      }
    }
    // On a pill's round end a 45° side passes outside the curve, or meets it
    // at a kink. Run the side tangent to the curve instead, so the border
    // flows into it without a corner.
    const curve = radius - line;
    const centre = { depth: radius, along: direction < 0 ? radius : length - radius };
    const dx = tip.depth - centre.depth;
    const dy = tip.along - centre.along;
    const distance = Math.hypot(dx, dy);
    if (distance <= curve) return { depth: line, along: center + direction * ARROW_REACH };
    const base = Math.atan2(dy, dx);
    const spread = Math.acos(curve / distance);
    const candidates = [base + spread, base - spread].map((angle) => ({
      depth: centre.depth + curve * Math.cos(angle),
      along: centre.along + curve * Math.sin(angle),
    }));
    // The tangent on this side of the tip.
    return direction < 0
      ? candidates[0].along < candidates[1].along
        ? candidates[0]
        : candidates[1]
      : candidates[0].along > candidates[1].along
        ? candidates[0]
        : candidates[1];
  };
  const start = meet(-1);
  const end = meet(1);
  const inside = Math.max(start.depth, end.depth) + border + 1;
  const point = ({ depth, along }: { depth: number; along: number }) => {
    const [x, y] =
      side === "right"
        ? [depth, along]
        : side === "left"
          ? [width - depth, along]
          : side === "bottom"
            ? [along, depth]
            : [along, height - depth];
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  return {
    fill: `M${point(tip)}L${point(start)}L${point({ depth: inside, along: start.along })}L${point({ depth: inside, along: end.along })}L${point(end)}Z`,
    stroke: `M${point(start)}L${point(tip)}L${point(end)}`,
  };
}

/** Position is geometry, not animation. One write per frame, never a spring chasing a pointer. */
export function useTooltipPosition({
  open,
  anchor,
  floatingRef,
  arrowRef,
  anchorPoint,
  followCursor,
  side,
  align,
  sideOffset,
  onDismiss,
  onPosition,
  pointer,
}: {
  open: boolean;
  anchor: TooltipAnchor | null;
  floatingRef: RefObject<HTMLSpanElement | null>;
  arrowRef?: RefObject<SVGSVGElement | null>;
  anchorPoint?: TooltipPoint;
  followCursor: boolean;
  side: TooltipSide;
  align: TooltipAlign;
  sideOffset?: number;
  onDismiss: () => void;
  onPosition: (side: TooltipSide) => void;
  pointer: ReturnType<typeof useTooltipPointer>;
}) {
  const { cursor, onMove } = pointer;
  const preferred: Placement = align === "center" ? side : `${side}-${align}`;
  const cursorSide = useRef<Placement | null>(null);
  useLayoutEffect(() => {
    cursorSide.current = open ? preferred : null;
  }, [open, preferred]);
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
  useLayoutEffect(() => {
    onMove.current = schedule;
    return () => {
      onMove.current = null;
    };
  }, [onMove, schedule]);
  const pointX = anchorPoint?.x;
  const pointY = anchorPoint?.y;

  // Latest committed inputs are read without recreating observers for every period/content update.
  useLayoutEffect(() => {
    update.current = () => {
      const floating = floatingRef.current;
      if (!open || !anchor || !floating) return;
      const revision = ++version.current;
      const currentCursor = followCursor ? cursor.current : null;
      const virtual = Boolean(currentCursor) || pointX !== undefined || pointY !== undefined;
      const reference: Element | VirtualElement = virtual
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
      const arrowElement = arrowRef?.current ?? null;
      void computePosition(reference, floating, {
        strategy: "fixed",
        placement: currentCursor ? (cursorSide.current ?? preferred) : preferred,
        middleware: [
          offset(sideOffset ?? (currentCursor ? 12 : 8)),
          flip({ padding: 8 }),
          shift({ padding: 8 }),
          ...(arrowElement ? [arrowMiddleware({ element: arrowElement, padding: 10 })] : []),
          // A label left floating over whatever scrolled into its trigger's place
          // describes nothing there. Points inside a chart move with the chart.
          ...(virtual ? [] : [hide({ strategy: "referenceHidden" })]),
        ],
      }).then(({ x, y, placement, middlewareData }) => {
        if (version.current !== revision || !floating.isConnected) return;
        // Hold the chosen side for this hover session. Crossing a flip threshold
        // repeatedly must not bounce the surface above and below the pointer.
        if (currentCursor) cursorSide.current = placement;
        else cursorSide.current = null;
        const placedSide = placement.split("-")[0] as TooltipSide;
        const dpr = window.devicePixelRatio || 1;
        floating.style.transform = `translate3d(${Math.round(x * dpr) / dpr}px, ${Math.round(y * dpr) / dpr}px, 0)`;
        floating.style.setProperty("--tooltip-origin", ORIGIN[placedSide]);
        // A box with no size has no clipped state to report, only a missing layout.
        const box = anchor.getBoundingClientRect();
        const clipped =
          Boolean(middlewareData.hide?.referenceHidden) && (box.width > 0 || box.height > 0);
        floating.style.visibility = clipped ? "hidden" : "visible";
        floating.dataset.placement = placement;
        const surface = arrowElement?.parentElement;
        if (arrowElement && surface) {
          // The middleware centres the 12px arrow box along the edge; its
          // centre is where the tip points. The paths are drawn in the
          // surface's border-box coordinates, so the svg sits at its corner.
          const { x: ax, y: ay } = middlewareData.arrow ?? {};
          const vertical = placedSide === "top" || placedSide === "bottom";
          const width = surface.offsetWidth;
          const height = surface.offsetHeight;
          const along = (vertical ? ax : ay) ?? ((vertical ? width : height) - ARROW_SIZE) / 2;
          const style = getComputedStyle(surface);
          const shape = arrowShape({
            side: placedSide,
            center: along + ARROW_SIZE / 2,
            width,
            height,
            // `rounded-full` resolves to a huge radius; the box clamps it to half its short side.
            radius: Math.min(Number.parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2),
            border: surface.clientLeft,
          });
          Object.assign(arrowElement.style, {
            left: `${-surface.clientLeft}px`,
            top: `${-surface.clientTop}px`,
            right: "auto",
            bottom: "auto",
          });
          arrowElement.querySelector("[data-arrow-fill]")?.setAttribute("d", shape.fill);
          arrowElement.querySelector("[data-arrow-stroke]")?.setAttribute("d", shape.stroke);
          // Paint with whatever the surface resolved to, so a restyled tooltip
          // keeps a matching arrow without a second set of classes. A
          // see-through border is drawn over the surface's own background, so
          // the stroke takes that blended colour: half of it sits over the
          // page, and it overlaps the border where the two meet.
          arrowElement.style.setProperty("--tooltip-arrow-fill", style.backgroundColor);
          arrowElement.style.setProperty(
            "--tooltip-arrow-stroke",
            blend(style.borderTopColor, style.backgroundColor),
          );
        }
        onPosition(placedSide);
      });
    };
    if (open) schedule();
  }, [
    open,
    anchor,
    floatingRef,
    arrowRef,
    followCursor,
    pointX,
    pointY,
    preferred,
    sideOffset,
    schedule,
    onPosition,
    cursor,
  ]);

  useLayoutEffect(() => {
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
  }, [open, anchor, floatingRef, followCursor, onDismiss, schedule, cursor]);

  useLayoutEffect(
    () => () => {
      version.current++;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
}

/** Pointer lifetime belongs to the anchor, including the opening delay. */
export function useTooltipPointer(anchor: TooltipAnchor | null, followCursor: boolean) {
  const cursor = useRef<TooltipPoint | null>(null);
  const onMove = useRef<(() => void) | null>(null);
  const pointerFocus = useRef(false);
  useLayoutEffect(() => {
    if (!anchor || !followCursor) return;
    const point = (event: PointerEvent) => {
      if (event.type === "pointermove" && event.pointerType === "touch" && !event.buttons) return;
      cursor.current = { x: event.clientX, y: event.clientY };
      if (event.type === "pointerdown") pointerFocus.current = true;
      onMove.current?.();
    };
    const keyboard = () => {
      cursor.current = null;
      pointerFocus.current = false;
      onMove.current?.();
    };
    const focus = () => {
      if (!pointerFocus.current) cursor.current = null;
      pointerFocus.current = false;
      onMove.current?.();
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
  }, [anchor, followCursor]);

  return useMemo(() => ({ cursor, onMove }), []);
}
