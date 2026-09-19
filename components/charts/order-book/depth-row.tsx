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
}: {
  row: DepthLevel;
  fraction: number;
  entranceIndex: number;
  color: string;
  formatPrice: (value: number) => string;
  formatSize: (value: number) => string;
  reduce: boolean;
}) {
  const opacity = useMotionValue(0);
  const previousSize = useRef(row.size);
  const entered = useRef(false);
  useEffect(() => {
    entered.current = true;
  }, []);

  useEffect(() => {
    if (previousSize.current === row.size) {
      opacity.set(0);
      return;
    }
    previousSize.current = row.size;
    // Retarget an interrupted pulse from its current opacity, without remounting text.
    let fade: ReturnType<typeof animate> | undefined;
    const rise = animate(opacity, reduce ? 0.06 : 0.14, {
      duration: 0.06,
      ease: EASE_OUT,
      onComplete: () => {
        fade = animate(opacity, 0, { duration: 0.22, ease: EASE_OUT });
      },
    });
    return () => {
      rise.stop();
      fade?.stop();
    };
  }, [row.size, opacity, reduce]);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.18,
        ease: EASE_OUT,
        delay: reduce || entered.current ? 0 : Math.min(entranceIndex, 8) * 0.025,
      }}
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
            <div className="absolute inset-y-0 left-0 w-px bg-current opacity-30" />
          </motion.div>
          <motion.div style={{ opacity }} className="absolute inset-0 bg-current" />
          <div className="absolute inset-0 bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-[0.05]" />
        </div>
        <span className="relative">{formatPrice(row.price)}</span>
      </td>
      <td className="relative px-4 py-0 text-right text-foreground">{formatSize(row.size)}</td>
      <td className="relative px-4 py-0 text-right text-muted-foreground">
        {formatSize(row.total)}
      </td>
    </motion.tr>
  );
}
