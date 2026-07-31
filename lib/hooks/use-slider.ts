"use client";

import { type KeyboardEvent, type PointerEvent, useCallback, useRef, useState } from "react";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface SliderOptions {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  "aria-label"?: string;
  /** Announced instead of the raw number — pass one when the value carries a
   * unit or a suffix ("72.5 kg", "35%"); a bare number needs no valueText. */
  formatValueText?: (value: number) => string;
}

/**
 * Shared value + input plumbing for slider designs: controlled/uncontrolled
 * value, step snapping, pointer-capture drag along a track and arrow-key
 * control. Visuals and motion live in the component; this only owns the number.
 */
export function useSlider({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  "aria-label": ariaLabel,
  formatValueText,
}: SliderOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const controlled = value !== undefined;
  const current = clamp(controlled ? value : internal, min, max);
  const percent = ((current - min) / (max - min)) * 100;

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(Math.round((next - min) / step) * step + min, min, max);
      // Fractional steps (0.1, 0.05) accumulate float dust — trim it.
      const clean = Number(snapped.toFixed(6));
      if (!controlled) setInternal(clean);
      onValueChange?.(clean);
    },
    [controlled, onValueChange, min, max, step],
  );

  const commitFromX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      commit(min + ratio * (max - min));
    },
    [commit, min, max],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      // optional: test DOMs and older browsers omit pointer capture
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setDragging(true);
      commitFromX(event.clientX);
    },
    [disabled, commitFromX],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging || disabled) return;
      commitFromX(event.clientX);
    },
    [dragging, disabled, commitFromX],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      const map: Record<string, number> = {
        ArrowRight: current + step,
        ArrowUp: current + step,
        ArrowLeft: current - step,
        ArrowDown: current - step,
        PageUp: current + step * 10,
        PageDown: current - step * 10,
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

  return {
    current,
    percent,
    dragging,
    min,
    max,
    step,
    commit,
    /** Pointer handlers for the track element — drag anywhere on it. */
    trackProps: {
      ref: trackRef,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    /** ARIA + keyboard props for the focusable slider element. */
    sliderProps: {
      role: "slider" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-label": ariaLabel,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": current,
      "aria-valuetext": formatValueText?.(current),
      "aria-disabled": disabled || undefined,
      onKeyDown,
    },
  };
}
