"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Render a tick dot at each step. */
  showTicks?: boolean;
  /** Bloom a magnifier lens ring around the thumb while dragging. */
  lens?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Slider({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showTicks = true,
  lens = true,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [active, setActive] = useState(false);
  const controlled = value !== undefined;
  const current = clamp(controlled ? value : internal, min, max);
  const percent = ((current - min) / (max - min)) * 100;

  const steps = Math.floor((max - min) / step);
  const ticks =
    showTicks && steps > 0 && steps <= 50
      ? Array.from({ length: steps + 1 }, (_, i) => min + i * step)
      : [];

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(Math.round((next - min) / step) * step + min, min, max);
      if (!controlled) setInternal(snapped);
      onValueChange?.(snapped);
    },
    [controlled, onValueChange, min, max, step],
  );

  const valueFromX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return current;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return min + ratio * (max - min);
    },
    [current, min, max],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setActive(true);
      commit(valueFromX(event.clientX));
    },
    [disabled, commit, valueFromX],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!active || disabled) return;
      commit(valueFromX(event.clientX));
    },
    [active, disabled, commit, valueFromX],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setActive(false);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const map: Record<string, number> = {
        ArrowRight: current + step,
        ArrowUp: current + step,
        ArrowLeft: current - step,
        ArrowDown: current - step,
        Home: min,
        End: max,
      };
      if (event.key in map) {
        event.preventDefault();
        commit(map[event.key]);
      }
    },
    [disabled, current, step, min, max, commit],
  );

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative flex h-10 w-full touch-none select-none items-center rounded-full bg-muted",
        disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* ticks */}
      {ticks.map((t) => {
        const tp = ((t - min) / (max - min)) * 100;
        return (
          <span
            key={t}
            className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
            style={{ left: `${tp}%` }}
          />
        );
      })}

      {/* lens ring */}
      {lens && !reduce ? (
        <AnimatePresence>
          {active ? (
            <motion.span
              className="pointer-events-none absolute top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/40 bg-background/5 backdrop-blur-[1px]"
              style={{ left: `${percent}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRING_PRESS}
            />
          ) : null}
        </AnimatePresence>
      ) : null}

      {/* vertical bar thumb */}
      <motion.div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        animate={reduce ? undefined : { scaleY: active ? 1.3 : 1 }}
        transition={SPRING_PRESS}
        className="absolute h-5 w-1.5 -translate-x-1/2 rounded-full bg-foreground shadow-sm outline-none ring-foreground/30 focus-visible:ring-4"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}
