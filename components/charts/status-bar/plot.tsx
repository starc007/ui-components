"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useStatusBar } from "./context";

// Spread a short entrance across the entire history, even with hundreds of periods.
const ENTRANCE_SPAN = 0.18;
const ENTRANCE_TRANSFORM = ["translateY(4px) scaleY(0.9)", "translateY(0px) scaleY(1)"];

export interface StatusBarPlotProps {
  className?: string;
  /** Customize segment height and roundness independently of the 44px hit area. */
  barClassName?: string;
  showLabels?: boolean;
  children?: ReactNode;
}

export function StatusBarPlot({
  className,
  barClassName,
  showLabels = true,
  children,
}: StatusBarPlotProps) {
  const {
    rows,
    label,
    activeIndex,
    setActive,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    reduce,
    canHover,
  } = useStatusBar();
  const pointerDriven = useRef(false);
  const focused = useRef(false);
  const lastPointerId = useRef<string | null>(null);
  const index = Math.max(activeIndex, 0);
  const row = rows[index];
  const inspectPointer = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const fraction = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const id = rows[Math.min(rows.length - 1, Math.floor(fraction * rows.length))].datum.id;
    setActive(id);
    if (lastPointerId.current !== id) setTooltipOpen(true);
    lastPointerId.current = id;
  };
  if (!rows.length)
    return <p className={cn("py-4 text-sm text-muted-foreground", className)}>No status data</p>;
  return (
    <div data-slot="status-bar-plot" className={cn("min-w-0 space-y-1.5", className)}>
      <div
        ref={plotRef}
        className="relative h-11 rounded-md has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring"
      >
        <div aria-hidden="true" className="flex h-full items-center gap-0.5 sm:gap-1">
          {rows.map(({ datum, status }, i) => {
            const active = tooltipOpen && activeIndex === i;
            const delay = reduce ? 0 : (i / Math.max(rows.length - 1, 1)) * ENTRANCE_SPAN;
            return (
              <motion.span
                key={datum.id}
                data-status-period={datum.id}
                data-status={status.id}
                className={cn("relative block h-8 min-w-0 flex-1 rounded-full", barClassName)}
                initial={{ opacity: 0 }}
                whileInView={
                  reduce ? { opacity: 1 } : { opacity: 1, transform: ENTRANCE_TRANSFORM }
                }
                viewport={{ once: true }}
                transition={{
                  opacity: { duration: reduce ? 0.15 : 0.24, ease: EASE_OUT, delay },
                  transform: { ...SPRING_PRESS, delay },
                }}
              >
                {/* Stable period keys keep the history still. Only the changed
                    color layer crossfades when a new status arrives. */}
                <AnimatePresence initial={false}>
                  <motion.span
                    key={`${status.id}:${status.color}`}
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: status.color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }}
                    transition={{ duration: 0.16, ease: EASE_OUT }}
                  />
                </AnimatePresence>
                <motion.span
                  className="pointer-events-none absolute -inset-0.5 rounded-[inherit] ring-1 ring-foreground/60"
                  initial={false}
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.1, ease: EASE_OUT }}
                />
              </motion.span>
            );
          })}
        </div>
        <input
          type="range"
          aria-label={`${label}: inspect period`}
          min={0}
          max={rows.length - 1}
          step={1}
          value={index}
          aria-valuetext={[row.datum.label, row.status.label, row.datum.description]
            .filter(Boolean)
            .join(". ")}
          aria-describedby={tooltipOpen && activeIndex >= 0 ? tooltipId : undefined}
          className="absolute inset-0 m-0 h-full w-full cursor-crosshair opacity-0"
          onFocus={() => {
            focused.current = true;
            if (!pointerDriven.current) {
              setActive(row.datum.id);
              setTooltipOpen(true);
            }
          }}
          onBlur={() => {
            focused.current = false;
            pointerDriven.current = false;
            setTooltipOpen(false);
          }}
          onPointerEnter={(event) => {
            if (canHover && event.pointerType !== "touch") inspectPointer(event);
          }}
          onPointerMove={(event) => {
            if (
              event.pointerType === "touch" ? event.buttons === 1 : canHover || event.buttons === 1
            )
              inspectPointer(event);
          }}
          onPointerLeave={() => {
            lastPointerId.current = null;
            if (!focused.current || pointerDriven.current) setTooltipOpen(false);
          }}
          onPointerDown={(event) => {
            pointerDriven.current = true;
            lastPointerId.current = null;
            inspectPointer(event);
          }}
          onPointerCancel={() => {
            pointerDriven.current = false;
            setTooltipOpen(false);
          }}
          onClick={() => {
            // Native range changes finish before click. Release the pointer
            // guard so subsequent assistive-technology changes are accepted.
            pointerDriven.current = false;
          }}
          onKeyDown={(event) => {
            pointerDriven.current = false;
            if (event.key === "Escape") setTooltipOpen(false);
            else if (
              ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
            )
              setTooltipOpen(true);
          }}
          onChange={(event) => {
            // Native thumb travel differs from equal-width bars. Pointer hit
            // testing owns pointer gestures; the range owns keyboard and AT input.
            if (pointerDriven.current) return;
            const next = rows[Number(event.target.value)];
            if (next) {
              setActive(next.datum.id);
              setTooltipOpen(true);
            }
          }}
        />
      </div>
      {showLabels ? (
        <div className="flex justify-between gap-4 text-xs text-muted-foreground">
          <span>{rows[0].datum.label}</span>
          <span>{rows.at(-1)?.datum.label}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
