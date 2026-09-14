"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from "react";
import { TooltipSurface } from "@/components/motion/tooltip-surface";
import { EASE_OUT, SPRING_GLIDE } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface ChartTooltipProps {
  open: boolean;
  id?: string;
  containerRef: RefObject<HTMLElement | SVGSVGElement | null>;
  /** Coordinates in the container, or in viewBox units for SVG charts. */
  point: { x: number; y: number };
  /** Optional cell selector, measured again when the grid resizes. */
  anchor?: string;
  viewBox?: { width: number; height: number };
  children?: ReactNode;
  className?: string;
}

/** One measured readout shared by chart primitives; stays inside its rendered container. */
export function ChartTooltip(props: ChartTooltipProps) {
  return <AnimatePresence>{props.open ? <ChartTooltipContent {...props} /> : null}</AnimatePresence>;
}

function ChartTooltipContent({
  containerRef,
  point,
  viewBox,
  anchor,
  children,
  className,
  id,
}: ChartTooltipProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    tipWidth: number;
    tipHeight: number;
    snap: boolean;
  } | null>(null);
  const x = point.x;
  const y = point.y;
  const viewWidth = viewBox?.width;
  const viewHeight = viewBox?.height;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const tip = ref.current;
    if (!container || !tip) return;
    const measure = () => {
      const width = container.clientWidth || container.getBoundingClientRect().width;
      const height = container.clientHeight || container.getBoundingClientRect().height;
      // Offset dimensions are unaffected by the surface's entrance scale.
      const tipWidth = tip.offsetWidth;
      const tipHeight = tip.offsetHeight;
      const cell = anchor ? container.querySelector(anchor)?.getBoundingClientRect() : null;
      const bounds = container.getBoundingClientRect();
      const px = cell ? cell.left - bounds.left + cell.width / 2 : viewWidth ? (x * width) / viewWidth : x;
      const py = cell ? cell.top - bounds.top : viewHeight ? (y * height) / viewHeight : y;
      // A composed Plot may contain padding or content before the SVG. Convert
      // the chart-local point into its tooltip positioning parent's coordinates.
      const parent = tip.offsetParent;
      const parentBounds = parent?.getBoundingClientRect();
      const offsetX = parentBounds ? bounds.left - parentBounds.left - (parent?.clientLeft ?? 0) + (parent?.scrollLeft ?? 0) : 0;
      const offsetY = parentBounds ? bounds.top - parentBounds.top - (parent?.clientTop ?? 0) + (parent?.scrollTop ?? 0) : 0;
      const next = {
        x: offsetX + Math.max(0, Math.min(width - tipWidth, px - tipWidth / 2)),
        y: offsetY + Math.max(0, Math.min(height - tipHeight, py >= tipHeight + 8 ? py - tipHeight - 8 : py + 8)),
      };
      setPosition((previous) => {
        const snap =
          !previous ||
          previous.width !== width ||
          previous.height !== height ||
          previous.tipWidth !== tipWidth ||
          previous.tipHeight !== tipHeight;
        if (!snap && previous.x === next.x && previous.y === next.y) return previous;
        return { ...next, width, height, tipWidth, tipHeight, snap };
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(tip);
    return () => observer.disconnect();
  }, [containerRef, x, y, viewWidth, viewHeight, anchor]);

  return (
    <TooltipSurface
      ref={ref}
      id={id}
      className={cn("pointer-events-none absolute left-0 top-0 z-10 max-w-full whitespace-normal", className)}
      style={{ visibility: position ? "visible" : "hidden", opacity: 1, maxWidth: position?.width }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: position?.x ?? 0, y: position?.y ?? 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } }}
      transition={{
        x: reduce || position?.snap ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE },
        y: reduce || position?.snap ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE },
        opacity: { duration: 0.14, ease: EASE_OUT },
      }}
    >
      {children}
    </TooltipSurface>
  );
}
