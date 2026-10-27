"use client";

import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TooltipSurface } from "@/components/motion/tooltip-surface";
import { cn } from "@/lib/utils";
import { XYTooltipContent, type XYTooltipRow } from "../xy/tooltip-content";
import { useLineChart } from "./context";

export interface LineChartTooltipData {
  category: string;
  index: number;
  rows: XYTooltipRow[];
}

export interface LineChartTooltipProps {
  children?: ReactNode | ((data: LineChartTooltipData) => ReactNode);
  className?: string;
  /**
   * `auto` sits right of the point, flips left near the right edge, and on
   * plots too narrow for either moves above or below the point instead.
   */
  side?: "auto" | "left" | "right";
}

const GAP = 16;
/** The panel may extend this far into the axis gutters beside the plot, in px. */
const BLEED = { left: 40, right: 12 } as const;
// Softer than the crosshair's layout spring on purpose: the panel trails a
// beat behind the point it describes instead of moving rigidly with it.
const FOLLOW = { type: "spring", stiffness: 260, damping: 28, mass: 0.7 } as const;

/**
 * A panel inside the plot that springs after the inspected point, beside its
 * highest visible value, so it never covers the dots it describes.
 */
export function LineChartTooltip({ children, className, side = "auto" }: LineChartTooltipProps) {
  const {
    categories,
    visibleRows,
    domain,
    activeIndex,
    open,
    loading,
    overlay,
    geometry,
    tooltipId,
    formatValue,
    reduce,
    touching,
  } = useLineChart();
  const panelRef = useRef<HTMLDivElement>(null);
  // Kept between openings: the panel's size barely changes from one point to the next.
  const [size, setSize] = useState({ width: 224, height: 96 });
  const category = loading ? undefined : categories[activeIndex];
  const visible = open && category !== undefined;
  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!visible || !node) return;
    const update = () =>
      setSize((previous) =>
        previous.width === node.offsetWidth && previous.height === node.offsetHeight
          ? previous
          : { width: node.offsetWidth, height: node.offsetHeight },
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);
  if (!overlay) return null;

  const rows: XYTooltipRow[] = visibleRows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    value: row.values[activeIndex] ?? null,
  }));
  const values = rows.flatMap((row) => (row.value === null ? [] : [row.value]));
  const top = values.length ? Math.max(...values) : domain.max;
  const n = categories.length;
  const { width: W, height: H } = geometry;
  const px = (n === 1 ? 0.5 : Math.max(activeIndex, 0) / (n - 1)) * W;
  const py = ((domain.max - top) / (domain.max - domain.min || 1)) * H;
  const minX = -BLEED.left;
  const maxX = W + BLEED.right;
  const fitsRight = px + GAP + size.width <= maxX;
  const fitsLeft = px - GAP - size.width >= minX;
  const placement =
    side === "right" || (side === "auto" && fitsRight)
      ? "right"
      : side === "left" || (side === "auto" && fitsLeft)
        ? "left"
        : py - GAP - size.height >= 0
          ? "above"
          : "below";
  const clampX = (value: number) => Math.min(Math.max(value, minX), maxX - size.width);
  const clampY = (value: number) => Math.min(Math.max(value, -8), Math.max(-8, H + 8 - size.height));
  const position =
    placement === "right"
      ? { x: px + GAP, y: clampY(py - size.height / 2) }
      : placement === "left"
        ? { x: px - GAP - size.width, y: clampY(py - size.height / 2) }
        : {
            x: clampX(px - size.width / 2),
            y: placement === "above" ? py - GAP - size.height : py + GAP,
          };
  const origin = {
    right: "left center",
    left: "right center",
    above: "bottom center",
    below: "top center",
  }[placement];

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="tooltip"
          ref={panelRef}
          className="pointer-events-none absolute top-0 left-0 z-10 w-max"
          initial={position}
          animate={position}
          // The trailing follow suits a mouse; under a finger it reads as lag.
          transition={reduce || touching ? { duration: 0 } : FOLLOW}
        >
          <TooltipSurface
            id={tooltipId}
            style={{ "--tooltip-origin": origin } as CSSProperties}
            className={cn("max-w-[min(20rem,calc(100vw-2rem))] py-2", className)}
          >
            {typeof children === "function"
              ? children({ category, index: activeIndex, rows })
              : (children ?? (
                  <XYTooltipContent title={category} rows={rows} formatValue={formatValue} />
                ))}
          </TooltipSurface>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    overlay,
  );
}
