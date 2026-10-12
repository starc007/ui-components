"use client";

/* The ring sweeps in once it scrolls into view: it turns from -90deg and
 * grows while segments fade in clockwise, 60ms apart. Hovering a segment, or
 * focusing its legend item, pops it outward from the ring's centre and fades
 * the rest. Everything animates transform and opacity. Hover is read from
 * static hit arcs, so a popping segment never slides out from under the
 * pointer and toggles itself. Reduced motion: the ring appears in place and
 * emphasis changes without easing. */

import { motion, useInView } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useDonutChart } from "./context";
import { DONUT_SIZE } from "./model";

const CENTER = DONUT_SIZE / 2;
/** Scale around the ring's centre rather than each arc's own box. */
const RING_ORIGIN = {
  transformBox: "view-box",
  transformOrigin: `${CENTER}px ${CENTER}px`,
} as const;

export type DonutChartPlotProps = {
  /** Centered overlay, usually `DonutChartCenter`. */
  children?: ReactNode;
  className?: string;
};

export function DonutChartPlot({ children, className }: DonutChartPlotProps) {
  const { placed, radius, thickness, active, setActive, label, reduce, canHover } =
    useDonutChart();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const shown = reduce || inView;
  // Stagger segments only for the first sweep, not when emphasis clears.
  const [entered, setEntered] = useState(false);

  return (
    <div ref={ref} className={cn("relative mx-auto aspect-square w-full max-w-64", className)}>
      <svg
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        role="img"
        aria-label={label}
        className="size-full overflow-visible"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted"
          opacity={0.6}
        />
        <motion.g
          style={RING_ORIGIN}
          initial={reduce ? false : { rotate: -90, scale: 0.88, opacity: 0 }}
          animate={shown ? { rotate: 0, scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          onAnimationComplete={() => setEntered(true)}
        >
          {placed.map((segment, index) => {
            const focused = active === segment.id;
            const dimmed = active !== null && !focused;
            return (
              <motion.path
                key={segment.id}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                style={RING_ORIGIN}
                initial={reduce ? false : { opacity: 0 }}
                animate={
                  shown
                    ? { opacity: dimmed ? 0.3 : 1, scale: focused ? 1.05 : 1 }
                    : undefined
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        opacity: {
                          duration: 0.4,
                          ease: EASE_OUT,
                          delay: entered ? 0 : 0.15 + index * 0.06,
                        },
                        scale: SPRING_LAYOUT,
                      }
                }
                pointerEvents="none"
                aria-hidden="true"
              />
            );
          })}
        </motion.g>
        {/* Static, slightly wider hit arcs own hover. They never scale, so the
            pointer stays on the same segment while its visual pops. The svg's
            img role already hides them; the legend carries keyboard access. */}
        <g>
          {placed.map((segment) => (
            <path
              key={segment.id}
              d={segment.path}
              fill="none"
              stroke="transparent"
              strokeWidth={thickness + 8}
              strokeLinecap="round"
              pointerEvents={shown ? "stroke" : "none"}
              className="cursor-pointer"
              onPointerEnter={canHover ? () => setActive(segment.id) : undefined}
              onPointerLeave={canHover ? () => setActive(null) : undefined}
            />
          ))}
        </g>
      </svg>
      {children ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
