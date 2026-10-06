"use client";

import { motion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useVolumeProfile } from "./context";

export interface VolumeProfilePlotProps {
  className?: string;
  barClassName?: string;
  /** Plot height is set by className; default 20rem. */
  showAxes?: boolean;
  children?: ReactNode;
}

export function VolumeProfilePlot({
  className,
  barClassName,
  showAxes = true,
  children,
}: VolumeProfilePlotProps) {
  const {
    rows,
    label,
    maxVolume,
    priceLow,
    priceHigh,
    valueArea,
    formatPrice,
    formatVolume,
    color,
    pocColor,
    activeIndex,
    setActive,
    plotRef,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    describe,
    reduce,
    canHover,
  } = useVolumeProfile();
  const pointerDriven = useRef(false);
  const focused = useRef(false);
  const lastPointerId = useRef<string | null>(null);
  const index = Math.max(activeIndex, 0);
  const row = rows[index];
  const inspect = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.height) return;
    const fraction = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    // Hit-test real price geometry, including unequal bins and empty price gaps.
    const match =
      rows.find((item) => fraction >= item.top && fraction <= item.top + item.height) ??
      rows.reduce((nearest, item) =>
        Math.abs(item.center - fraction) < Math.abs(nearest.center - fraction) ? item : nearest,
      );
    setActive(match.id);
    if (lastPointerId.current !== match.id) setTooltipOpen(true);
    lastPointerId.current = match.id;
  };
  if (!rows.length)
    return (
      <p className={cn("py-12 text-center text-sm text-muted-foreground", className)}>
        No volume data
      </p>
    );
  return (
    <div data-slot="volume-profile-plot" className={cn("min-w-0", showAxes && "pb-6")}>
      <div className={cn("flex h-80 min-w-0 gap-3", className)}>
        {showAxes ? (
          <div
            aria-hidden="true"
            className="relative shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs"
          >
            {[1, 0.75, 0.5, 0.25, 0].map((position) => (
              <span key={position}>
                <span className="invisible block">
                  {formatPrice(priceLow + (priceHigh - priceLow) * position)}
                </span>
                <span
                  className="absolute right-0 -translate-y-1/2"
                  style={{ top: `${(1 - position) * 100}%` }}
                >
                  {formatPrice(priceLow + (priceHigh - priceLow) * position)}
                </span>
              </span>
            ))}
          </div>
        ) : null}
        <div
          ref={plotRef}
          className="relative min-w-0 flex-1 rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map((position) => (
              <span
                key={position}
                className="absolute inset-y-0 border-l border-border/60"
                style={{ left: `${position * 100}%` }}
              />
            ))}
            {rows.map((item, i) => (
              <div
                key={item.id}
                data-volume-bin={item.id}
                data-poc={item.isPoc || undefined}
                data-value-area={item.inValueArea || undefined}
                className="absolute inset-x-0 overflow-hidden py-px"
                style={{ top: `${item.top * 100}%`, height: `${item.height * 100}%` }}
              >
                <motion.div
                  className={cn("h-full w-full rounded-r-sm", barClassName)}
                  style={{
                    backgroundColor: item.isPoc ? pocColor : color,
                    transformOrigin: "left",
                  }}
                  initial={{ opacity: 0, transform: `scaleX(${item.proportion})` }}
                  animate={{
                    opacity: item.isPoc || item.inValueArea || !valueArea ? 0.9 : 0.3,
                    transform: `scaleX(${item.proportion})`,
                  }}
                  transition={{
                    transform: reduce ? { duration: 0 } : SPRING_LAYOUT,
                    opacity: { duration: 0.18, ease: EASE_OUT },
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-foreground/5"
                  initial={false}
                  animate={{ opacity: tooltipOpen && activeIndex === i ? 1 : 0 }}
                  transition={{ duration: 0.1, ease: EASE_OUT }}
                />
                {item.isPoc ? (
                  <span
                    className="absolute inset-x-0 top-1/2 border-t border-dashed"
                    style={{ borderColor: pocColor }}
                  >
                    <span className="absolute right-0 -translate-y-1/2 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
                      POC
                    </span>
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={rows.length - 1}
            step={1}
            value={index}
            aria-label={`${label}: inspect price level`}
            aria-orientation="vertical"
            aria-valuetext={describe(row)}
            aria-describedby={tooltipOpen && activeIndex >= 0 ? tooltipId : undefined}
            className="absolute inset-0 m-0 h-full w-full cursor-crosshair opacity-0"
            style={{ writingMode: "vertical-lr", direction: "rtl", touchAction: "pan-x" }}
            onFocus={() => {
              focused.current = true;
              if (!pointerDriven.current) {
                setActive(row.id);
                setTooltipOpen(true);
              }
            }}
            onBlur={() => {
              focused.current = false;
              pointerDriven.current = false;
              setTooltipOpen(false);
            }}
            onPointerEnter={(event) => {
              if (canHover && event.pointerType !== "touch") inspect(event);
            }}
            onPointerMove={(event) => {
              if (
                event.pointerType === "touch"
                  ? event.buttons === 1
                  : canHover || event.buttons === 1
              )
                inspect(event);
            }}
            onPointerLeave={() => {
              lastPointerId.current = null;
              if (!focused.current || pointerDriven.current) setTooltipOpen(false);
            }}
            onPointerDown={(event) => {
              pointerDriven.current = true;
              lastPointerId.current = null;
              inspect(event);
            }}
            onPointerCancel={() => {
              pointerDriven.current = false;
              setTooltipOpen(false);
            }}
            onClick={() => {
              pointerDriven.current = false;
            }}
            onKeyDown={(event) => {
              pointerDriven.current = false;
              if (event.key === "Escape") setTooltipOpen(false);
              else if (
                ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(
                  event.key,
                )
              ) {
                if (activeIndex < 0) setActive(row.id);
                setTooltipOpen(true);
              }
            }}
            onChange={(event) => {
              if (pointerDriven.current) return;
              const next = rows[Number(event.target.value)];
              if (next) {
                setActive(next.id);
                setTooltipOpen(true);
              }
            }}
          />
          {showAxes ? (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-full mt-2 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs"
            >
              <span>0</span>
              <span>{formatVolume(maxVolume / 2)}</span>
              <span>{formatVolume(maxVolume)}</span>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
