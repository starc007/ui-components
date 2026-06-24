"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

// Bouncy thumb feedback — low damping for a playful overshoot on grab.
const SPRING_BOUNCY = { type: "spring", stiffness: 500, damping: 14, mass: 0.7 } as const;

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Render a tick dot at each step. */
  showTicks?: boolean;
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
        "relative flex h-10 w-full touch-none select-none items-center overflow-hidden rounded-lg bg-muted",
        disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* fill — dark while dragging, light at rest */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-colors duration-200",
          active ? "bg-foreground" : "bg-foreground/15",
        )}
        style={{ width: `${percent}%` }}
      />

      {/* ticks */}
      {ticks.map((t) => {
        const tp = ((t - min) / (max - min)) * 100;
        const filled = t <= current;
        return (
          <span
            key={t}
            className={cn(
              "absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
              filled && active ? "bg-background/60" : "bg-foreground/25",
            )}
            style={{ left: `${tp}%` }}
          />
        );
      })}

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
        animate={reduce ? undefined : { scaleY: active ? 1.35 : 1 }}
        transition={SPRING_BOUNCY}
        className="absolute h-5 w-1.5 -translate-x-1/2 rounded-sm bg-foreground shadow-sm outline-none ring-foreground/30 focus-visible:ring-4"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}
