"use client";

import { ChevronsLeftRight } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SPRING_GLIDE, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const beforeAfterSliderMessages = {
  label: "Before and after comparison",
  before: "Before",
  after: "After",
  valueText: "{value}% before",
};

export type BeforeAfterSliderMessages = typeof beforeAfterSliderMessages;

export interface BeforeAfterSliderProps {
  /** Shown on the left of the divider, usually an image. */
  before: ReactNode;
  /** Shown on the right of the divider, usually an image of the same size. */
  after: ReactNode;
  /** Divider position as a percent of the width, 0 to 100 (controlled). */
  value?: number;
  /** Starting position when uncontrolled. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Show the Before and After labels in the top corners. */
  showLabels?: boolean;
  disabled?: boolean;
  labels?: Partial<BeforeAfterSliderMessages>;
  /** Size the frame here; it defaults to a 3:2 box at full width. */
  className?: string;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));
// Two decimals keep a drag smooth on wide images without a noisy value.
const round = (value: number) => Math.round(value * 100) / 100;
// Movement before a touch counts as a horizontal drag rather than a scroll.
const TOUCH_SLOP = 6;
// Half the handle, so grabbing it keeps the grab point instead of jumping.
const HANDLE_RADIUS = 20;

type Gesture = {
  id: number;
  left: number;
  width: number;
  startX: number;
  startY: number;
  /** Pointer distance from the divider when the handle was grabbed. */
  offset: number;
  /** False while a touch has not yet proved to be a horizontal drag. */
  active: boolean;
};

/**
 * Compare two images (or any two layers) with a draggable divider. Drag the
 * handle or anywhere on the frame, click to glide the divider there, or use
 * the arrow keys. On touch, a vertical swipe still scrolls the page.
 */
export function BeforeAfterSlider({
  before,
  after,
  value,
  defaultValue = 50,
  onValueChange,
  showLabels = true,
  disabled = false,
  labels,
  className,
}: BeforeAfterSliderProps) {
  const t = useMessages("beforeAfterSlider", beforeAfterSliderMessages, labels);
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(() => clamp(defaultValue));
  const controlled = value !== undefined;
  const current = clamp(controlled ? value : internal);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  // The next position change glides (a click or a key) instead of following
  // the pointer exactly.
  const glide = useRef(false);

  const position = useMotionValue(current);
  // clip-path, not a resize: the before layer keeps its full size, so the
  // two layers stay aligned pixel for pixel at every position.
  const clipPath = useTransform(position, (p) => `inset(0 ${100 - p}% 0 0)`);
  const dividerX = useTransform(position, (p) => `${p}%`);
  // Each label fades as the divider comes close, so neither is cut in half.
  const beforeOpacity = useTransform(position, [8, 22], [0, 1]);
  const afterOpacity = useTransform(position, [78, 92], [1, 0]);

  useLayoutEffect(() => {
    if (reduce || !glide.current) {
      position.stop();
      position.jump(current);
      return;
    }
    glide.current = false;
    animate(position, current, { type: "spring", ...SPRING_GLIDE });
  }, [current, position, reduce]);
  useEffect(() => () => position.stop(), [position]);

  const commit = (next: number, smooth: boolean) => {
    const clean = round(clamp(next));
    if (clean === current) return;
    glide.current = smooth;
    if (!controlled) setInternal(clean);
    onValueChange?.(clean);
  };

  const fromPointer = (active: Gesture, clientX: number) =>
    ((clientX - active.left - active.offset) / active.width) * 100;

  const start = (event: PointerEvent<HTMLDivElement>, active: Gesture) => {
    active.active = true;
    setDragging(true);
    capturePointer(event.currentTarget, event.pointerId);
    handleRef.current?.focus({ preventScroll: true });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0 || gesture.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const dividerPx = (position.get() / 100) * rect.width;
    const pointerPx = event.clientX - rect.left;
    const onHandle = Math.abs(pointerPx - dividerPx) <= HANDLE_RADIUS;
    const active: Gesture = {
      id: event.pointerId,
      left: rect.left,
      width: rect.width,
      startX: event.clientX,
      startY: event.clientY,
      offset: onHandle ? pointerPx - dividerPx : 0,
      active: false,
    };
    gesture.current = active;
    // A touch waits to see which way it moves; a mouse or pen drags at once.
    if (event.pointerType === "touch") return;
    event.preventDefault();
    start(event, active);
    if (!onHandle) commit(fromPointer(active, event.clientX), true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId || disabled) return;
    if (!active.active) {
      const dx = Math.abs(event.clientX - active.startX);
      const dy = Math.abs(event.clientY - active.startY);
      if (dx < TOUCH_SLOP && dy < TOUCH_SLOP) return;
      // A mostly vertical swipe belongs to the page.
      if (dy >= dx) {
        gesture.current = null;
        return;
      }
      start(event, active);
    }
    commit(fromPointer(active, event.clientX), false);
  };

  const end = (event: PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId) return;
    // Clear first: releasing capture fires lostpointercapture, which lands here again.
    gesture.current = null;
    // A tap that never became a drag glides the divider to the tap.
    if (!active.active && event.type === "pointerup" && !disabled) {
      commit(fromPointer(active, event.clientX), true);
    }
    setDragging(false);
    releasePointer(event.currentTarget, event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = event.shiftKey ? 10 : 1;
    const next = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + 10,
      PageDown: current - 10,
      Home: 0,
      End: 100,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    commit(next, true);
  };

  const chip =
    "pointer-events-none absolute top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a pointer surface for the slider below, which owns focus, keys and the accessible value.
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      // Images inside are the consumer's; stop the browser dragging them out.
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        "relative isolate aspect-[3/2] w-full touch-pan-y overflow-hidden rounded-2xl bg-muted",
        TOUCH_GESTURE_CLASS,
        disabled ? "opacity-60" : dragging ? "cursor-grabbing" : "cursor-ew-resize",
        className,
      )}
    >
      <div className="absolute inset-0">{after}</div>
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        {before}
      </motion.div>

      {showLabels ? (
        <div aria-hidden="true">
          <motion.span className={cn(chip, "left-3")} style={{ opacity: beforeOpacity }}>
            {t("before")}
          </motion.span>
          <motion.span className={cn(chip, "right-3")} style={{ opacity: afterOpacity }}>
            {t("after")}
          </motion.span>
        </div>
      ) : null}

      {/* Full width so a percent translate moves the divider by a percent of the frame. */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: dividerX }}>
        <div className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.12)]" />
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            ref={handleRef}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={t("label")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(current)}
            aria-valuetext={t("valueText", { value: Math.round(current) })}
            aria-orientation="horizontal"
            aria-disabled={disabled || undefined}
            onKeyDown={onKeyDown}
            animate={{ scale: dragging && !reduce ? 1.08 : 1 }}
            transition={SPRING_PRESS}
            className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white text-neutral-900 shadow-[0_0_0_1px_rgb(0_0_0/0.12)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
          >
            <ChevronsLeftRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
