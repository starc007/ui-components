"use client";

import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import type { DepthLevel } from "./model";

export function OrderBookDepthRow({
  row,
  fraction,
  entranceIndex,
  color,
  formatPrice,
  formatSize,
  reduce,
  inRange = false,
  onInspect,
  onSelect,
}: {
  row: DepthLevel;
  fraction: number;
  entranceIndex: number;
  color: string;
  formatPrice: (value: number) => string;
  formatSize: (value: number) => string;
  reduce: boolean;
  /** True when this level is inside the inspected depth range. */
  inRange?: boolean;
  /** Called with true when the row is hovered or its price focused, false on blur. */
  onInspect?: (inspect: boolean) => void;
  /** Renders the price as a button. */
  onSelect?: () => void;
}) {
  const highlight = useMotionValue(0);
  const previousSize = useRef(row.size);
  const entered = useRef(false);
  useEffect(() => {
    entered.current = true;
  }, []);

  useEffect(() => {
    const changed = previousSize.current !== row.size;
    previousSize.current = row.size;
    if (!changed || reduce) {
      highlight.set(0);
      return;
    }

    // A soft full-row tint identifies changed quantities. Retarget from
    // the current opacity when another snapshot interrupts the fade.
    let fade: ReturnType<typeof animate> | undefined;
    const rise = animate(highlight, 0.1, {
      duration: 0.08,
      ease: EASE_OUT,
      onComplete: () => {
        fade = animate(highlight, 0, { duration: 0.2, ease: EASE_OUT });
      },
    });
    return () => {
      rise.stop();
      fade?.stop();
    };
  }, [row.size, reduce, highlight]);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.18,
        ease: EASE_OUT,
        delay: reduce || entered.current ? 0 : Math.min(entranceIndex, 8) * 0.025,
      }}
      onPointerEnter={onInspect ? () => onInspect(true) : undefined}
      className={cn("group", color)}
    >
      <td className="relative h-8 px-4 py-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1 inset-y-px w-[calc(300%-8px)] overflow-hidden rounded-sm"
        >
          <motion.div
            initial={reduce ? false : { transform: `scaleX(${fraction * 0.85})`, opacity: 0 }}
            animate={{ transform: `scaleX(${fraction})`, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    ...SPRING_PANEL,
                    delay: entered.current ? 0 : Math.min(entranceIndex, 8) * 0.025,
                  }
            }
            className="absolute inset-0 origin-right overflow-hidden rounded-sm"
          >
            <div className="absolute inset-0 bg-current opacity-[0.12]" />
          </motion.div>
          <motion.div style={{ opacity: highlight }} className="absolute inset-0 bg-current" />
          <div
            className={cn(
              "absolute inset-0 bg-current transition-opacity duration-150",
              inRange ? "opacity-[0.08]" : "opacity-0 group-hover:opacity-[0.05]",
            )}
          />
        </div>
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            onFocus={() => onInspect?.(true)}
            onBlur={() => onInspect?.(false)}
            className="relative rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {formatPrice(row.price)}
          </button>
        ) : (
          <span className="relative">{formatPrice(row.price)}</span>
        )}
      </td>
      <td className="relative px-4 py-0 text-right text-foreground">
        {formatSize(row.size)}
      </td>
      <td className="relative px-4 py-0 text-right text-muted-foreground">
        {formatSize(row.total)}
      </td>
    </motion.tr>
  );
}
