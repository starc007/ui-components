"use client";

import { type CSSProperties, type PointerEvent, useRef } from "react";
import { cn } from "@/lib/utils";

export interface XYInspectorProps {
  count: number;
  activeIndex: number;
  onActive: (index: number) => void;
  /** Accessible name of the slider. */
  label: string;
  valueText: (index: number) => string;
  /** `point` snaps to the nearest sample (lines); `band` to the slot under the pointer (bars). */
  mode: "point" | "band";
  /** `vertical` reads categories top to bottom, for horizontal bars. */
  orientation?: "horizontal" | "vertical";
  open: boolean;
  setOpen: (open: boolean) => void;
  tooltipId?: string;
  canHover: boolean;
  /** Reports a touch drag starting and ending, so marks can track the finger 1:1. */
  onTouchChange?: (touching: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One invisible native range over the plot: a single tab stop for keyboard and
 * assistive technology, with pointer hit testing that matches the drawn marks.
 */
export function XYInspector({
  count,
  activeIndex,
  onActive,
  label,
  valueText,
  mode,
  orientation = "horizontal",
  open,
  setOpen,
  tooltipId,
  canHover,
  onTouchChange,
  className,
  style,
}: XYInspectorProps) {
  const pointerDriven = useRef(false);
  const focused = useRef(false);
  // Focus from a mouse click is incidental: it must not pin the tooltip open
  // once the pointer leaves. Focus from the keyboard (or keys pressed after a
  // click) is deliberate and keeps it open until blur or Escape.
  const mouseFocus = useRef(false);
  const last = useRef<number | null>(null);
  const index = activeIndex >= 0 ? activeIndex : count - 1;
  const vertical = orientation === "vertical";
  const inspectPointer = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const length = vertical ? bounds.height : bounds.width;
    if (!length || !count) return;
    const offset = vertical ? event.clientY - bounds.top : event.clientX - bounds.left;
    const fraction = Math.min(1, Math.max(0, offset / length));
    const next =
      mode === "point"
        ? Math.round(fraction * (count - 1))
        : Math.min(count - 1, Math.floor(fraction * count));
    onActive(next);
    if (last.current !== next) setOpen(true);
    last.current = next;
  };
  const step = (next: number) => {
    onActive(Math.min(count - 1, Math.max(0, next)));
    setOpen(true);
  };
  if (!count) return null;
  return (
    <input
      type="range"
      aria-label={label}
      aria-orientation={orientation}
      min={0}
      max={count - 1}
      step={1}
      value={index}
      aria-valuetext={valueText(index)}
      aria-describedby={open && activeIndex >= 0 ? tooltipId : undefined}
      className={cn("absolute m-0 cursor-crosshair touch-pan-y opacity-0", className)}
      style={style}
      onFocus={() => {
        focused.current = true;
        if (!pointerDriven.current) step(index);
      }}
      onBlur={() => {
        focused.current = false;
        mouseFocus.current = false;
        pointerDriven.current = false;
        setOpen(false);
      }}
      onPointerEnter={(event) => {
        if (canHover && event.pointerType !== "touch") inspectPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "touch" ? event.buttons === 1 : canHover || event.buttons === 1)
          inspectPointer(event);
      }}
      onPointerLeave={(event) => {
        last.current = null;
        // Touch fires a leave after every tap; tap-to-inspect stays open.
        const mouse = event.pointerType !== "touch" && mouseFocus.current;
        if (!focused.current || pointerDriven.current || mouse) setOpen(false);
      }}
      onPointerDown={(event) => {
        pointerDriven.current = true;
        if (event.pointerType === "touch") onTouchChange?.(true);
        else mouseFocus.current = true;
        last.current = null;
        inspectPointer(event);
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "touch") onTouchChange?.(false);
      }}
      onPointerCancel={(event) => {
        pointerDriven.current = false;
        if (event.pointerType === "touch") onTouchChange?.(false);
        setOpen(false);
      }}
      onClick={() => {
        // Native range changes finish before click. Release the pointer guard
        // so later assistive-technology changes are accepted.
        pointerDriven.current = false;
      }}
      onKeyDown={(event) => {
        pointerDriven.current = false;
        mouseFocus.current = false;
        if (event.key === "Escape") setOpen(false);
        else if (vertical && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          // Categories read top to bottom, so Down moves down the list.
          event.preventDefault();
          step(index + (event.key === "ArrowDown" ? 1 : -1));
        } else if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(
            event.key,
          )
        )
          setOpen(true);
      }}
      onChange={(event) => {
        // Native thumb travel differs from the drawn marks. Pointer hit testing
        // owns pointer gestures; the range owns keyboard and AT input.
        if (pointerDriven.current) return;
        step(Number(event.target.value));
      }}
    />
  );
}
