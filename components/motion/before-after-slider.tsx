"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_IN_OUT, SPRING_GLIDE, SPRING_MOUSE, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
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
  /** Sweep the divider once when the slider first scrolls into view, to show it moves. */
  hint?: boolean;
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
// How far, in percent, the first-view hint sweeps each way, and how long.
const HINT_REACH = 10;
const HINT_DURATION = 1.6;
// Divider speed (percent of the width per second) that reaches the full bend.
const BEND_SPEED = 250;
// How far the line's ends trail its middle at full bend, as a share of the height.
const BEND_MAX = 0.12;
// How far each chevron moves out from the center, in pixels.
const CHEVRON_SPLIT = { rest: 0, hover: 1.5, drag: 3 };

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
  hint = true,
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
  const [hovered, setHovered] = useState(false);
  const hoverCapable = useHoverCapable();
  const gesture = useRef<Gesture | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { once: true, amount: 0.6 });
  // The hint plays once per mount and never after the user has touched it.
  const hintState = useRef<"pending" | "done">(hint ? "pending" : "done");
  const hintRun = useRef<AnimationPlaybackControls | null>(null);
  // The next position change glides (a click or a key) instead of following
  // the pointer exactly.
  const glide = useRef(false);

  const position = useMotionValue(current);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  // The line bends like a rope held at the handle: its middle follows the
  // divider and its ends trail behind, more the faster it moves, then it
  // wobbles straight when it stops. Velocity covers drags, glides and the hint.
  const velocity = useVelocity(position);
  const pull = useTransform(velocity, [-BEND_SPEED, 0, BEND_SPEED], [-1, 0, 1]);
  const bend = useSpring(useTransform(pull, (amount) => (reduce ? 0 : amount)), SPRING_MOUSE);
  // clip-path, not a resize: the before layer keeps its full size, so the
  // two layers stay aligned pixel for pixel at every position. The cut follows
  // the line's curve. Until the frame is measured it is a plain straight cut.
  const clipPath = useTransform([position, bend, width, height], ([p, amount, w, h]: number[]) => {
    if (!w || !h) return `inset(0 ${100 - p}% 0 0)`;
    const middle = (p / 100) * w;
    const trail = amount * BEND_MAX * h;
    // The control point sits past the middle by as much as the ends trail,
    // so the curve passes exactly through the divider at half height.
    return `path("M0 0 L${middle - trail} 0 Q${middle + trail} ${h / 2} ${middle - trail} ${h} L0 ${h} Z")`;
  });
  // The same curve for the drawn line, in a 100 by 100 box stretched over the
  // frame, so it needs no measuring for its straight resting shape.
  const lineD = useTransform([position, bend, width, height], ([p, amount, w, h]: number[]) => {
    const trail = w ? ((amount * BEND_MAX * h) / w) * 100 : 0;
    return `M${p - trail} 0 Q${p + trail} 50 ${p - trail} 100`;
  });
  const dividerX = useTransform(position, (p) => `${p}%`);
  // Each label fades as the divider comes close, so neither is cut in half.
  const beforeOpacity = useTransform(position, [8, 22], [0, 1]);
  const afterOpacity = useTransform(position, [78, 92], [1, 0]);

  useLayoutEffect(() => {
    if (reduce || !glide.current) {
      position.stop();
      // set, not jump: jump zeroes the velocity the drag bend is read from.
      if (reduce) position.jump(current);
      else position.set(current);
      return;
    }
    glide.current = false;
    animate(position, current, { type: "spring", ...SPRING_GLIDE });
  }, [current, position, reduce]);
  useEffect(() => () => position.stop(), [position]);

  // The curved cut is drawn in pixels, so it needs the frame's size.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      width.set(rect.width);
      height.set(rect.height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width, height]);

  // The hint moves only the picture, never the value, so assistive tech hears
  // nothing and a controlled parent sees no change.
  useEffect(() => {
    if (!inView || reduce || disabled || hintState.current !== "pending") return;
    const from = position.get();
    const right = Math.min(100, from + HINT_REACH);
    const left = Math.max(0, from - HINT_REACH);
    const run = animate(position, [from, right, left, from], {
      duration: HINT_DURATION,
      ease: EASE_IN_OUT,
      times: [0, 0.3, 0.7, 1],
      delay: 0.25,
    });
    hintRun.current = run;
    // Done only once it finishes or the user cuts in (stopHint), so a cleanup
    // that stopped it early lets the next run play it from the start.
    run.then(() => {
      if (hintRun.current !== run) return;
      hintRun.current = null;
      hintState.current = "done";
    });
    return () => {
      if (hintRun.current !== run) return;
      run.stop();
      hintRun.current = null;
      position.jump(from);
    };
  }, [inView, reduce, disabled, position]);

  // Any input ends the hint where the value says the divider is.
  const stopHint = () => {
    hintState.current = "done";
    if (!hintRun.current) return;
    hintRun.current.stop();
    hintRun.current = null;
    position.jump(current);
  };

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
    stopHint();
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
    stopHint();
    commit(next, true);
  };

  const chip =
    "pointer-events-none absolute top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a pointer surface for the slider below, which owns focus, keys and the accessible value.
    <div
      ref={frameRef}
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

      {/* The stroke stays its pixel width however the box is stretched. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <motion.path
          d={lineD}
          fill="none"
          stroke="rgb(0 0 0 / 0.14)"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ strokeWidth: dragging && !reduce ? 5.5 : 4 }}
          transition={SPRING_PRESS}
        />
        <motion.path
          d={lineD}
          fill="none"
          stroke="white"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ strokeWidth: dragging && !reduce ? 3.5 : 2 }}
          transition={SPRING_PRESS}
        />
      </svg>

      {/* Full width so a percent translate moves the handle by a percent of the frame. */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: dividerX }}>
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
            onPointerEnter={(event) => {
              if (hoverCapable && event.pointerType !== "touch") setHovered(true);
            }}
            onPointerLeave={() => setHovered(false)}
            animate={{ scale: reduce ? 1 : dragging ? 1.08 : hovered ? 1.04 : 1 }}
            transition={SPRING_PRESS}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_0_0_1px_rgb(0_0_0/0.12)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
          >
            {/* The chevrons part as the handle is hovered and grabbed. */}
            {([ChevronLeft, ChevronRight] as const).map((Icon, index) => {
              const split = reduce
                ? 0
                : CHEVRON_SPLIT[dragging ? "drag" : hovered ? "hover" : "rest"];
              return (
                <motion.span
                  key={index === 0 ? "left" : "right"}
                  aria-hidden="true"
                  animate={{ x: index === 0 ? -split : split }}
                  transition={SPRING_PRESS}
                  className={cn("flex", index === 0 ? "-mr-1" : "-ml-1")}
                >
                  <Icon className="size-3.5" strokeWidth={2.5} />
                </motion.span>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
