"use client";

import {
  animate,
  type AnimationPlaybackControls,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ArcPickerOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ArcPickerSide = "top" | "bottom" | "left" | "right";

export type ArcPickerProps = Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  options: readonly ArcPickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The side the arc bows toward. Top and bottom scroll horizontally. */
  side?: ArcPickerSide;
  /** Radius in pixels. Larger radii make a gentler curve. */
  radius?: number;
  /** Minimum spacing along the arc. Horizontal sides also make room for label widths. */
  itemHeight?: number;
  visibleCount?: number;
  disabled?: boolean;
  name?: string;
};

// A short velocity projection lets a flick coast through several detents
// before the shared layout spring settles it, without a long free-running loop.
const COAST_SECONDS = 0.18;
const WHEEL_SETTLE_MS = 120;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ArcOption({
  option,
  index,
  position,
  radius,
  itemHeight,
  visibleCount,
  side,
  selected,
  disabled,
  setRef,
  onSelect,
}: {
  option: ArcPickerOption;
  index: number;
  position: MotionValue<number>;
  radius: number;
  itemHeight: number;
  visibleCount: number;
  side: ArcPickerSide;
  selected: boolean;
  disabled: boolean;
  setRef: (element: HTMLButtonElement | null) => void;
  onSelect: () => void;
}) {
  const horizontal = side === "top" || side === "bottom";
  const transform = useTransform(position, (at) => {
    const angle = clamp(((index - at) * itemHeight) / radius, -1.5, 1.5);
    const bend = radius * (1 - Math.cos(angle));
    const along = radius * Math.sin(angle);
    const x = horizontal ? along : side === "left" ? bend : -bend;
    const y = horizontal ? (side === "top" ? bend : -bend) : along;
    const rotation =
      ((side === "left" || side === "bottom" ? -angle : angle) * 180) / Math.PI;
    const anchor = horizontal ? "-50%" : side === "left" ? "-100%" : "0%";
    return `translate3d(${x}px, ${y}px, 0) translate(${anchor}, -50%) rotate(${rotation}deg)`;
  });
  const opacity = useTransform(position, (at) => {
    const distance = Math.abs(index - at);
    return (
      clamp((visibleCount / 2 + 0.5 - distance) / 1.5, 0, 1) *
      (disabled || option.disabled ? 0.35 : 1)
    );
  });
  const pointerEvents = useTransform(position, (at) =>
    Math.abs(index - at) < visibleCount / 2 ? "auto" : "none",
  );

  return (
    <motion.button
      ref={setRef}
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled || option.disabled}
      tabIndex={selected && !disabled && !option.disabled ? 0 : -1}
      data-slot="arc-picker-option"
      data-value={option.value}
      data-selected={selected || undefined}
      onClick={(event) => {
        if (!event.defaultPrevented) onSelect();
      }}
      className={cn(
        "absolute rounded-md px-2 py-1 text-2xl font-light whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35",
        horizontal && "overflow-hidden text-ellipsis text-center",
        !horizontal && (side === "left" ? "text-right" : "text-left"),
        selected ? "text-primary" : "text-muted-foreground",
      )}
      style={{
        top: horizontal ? (side === "top" ? 36 : "calc(100% - 36px)") : "50%",
        left: horizontal ? "50%" : side === "left" ? "58%" : "42%",
        transformOrigin: horizontal
          ? "center"
          : side === "left"
            ? "right center"
            : "left center",
        maxWidth: horizontal ? "calc(100% - 2rem)" : undefined,
        transform,
        opacity,
        pointerEvents,
      }}
    >
      {option.label}
    </motion.button>
  );
}

/** A radial single-choice picker with drag momentum and native button controls. */
export function ArcPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  side = "right",
  radius = 280,
  itemHeight = 48,
  visibleCount = 7,
  disabled = false,
  name,
  className,
  style,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onFocusCapture,
  onBlurCapture,
  onClickCapture,
  "aria-label": label = "Choose an option",
  "aria-describedby": describedBy,
  ...props
}: ArcPickerProps) {
  const reducedMotion = useReducedMotion();
  const horizontal = side === "top" || side === "bottom";
  const instructionsId = useId();
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const first = options.find((option) => !option.disabled)?.value;
  const [internalValue, setInternalValue] = useState(defaultValue ?? first);
  const controlled = value !== undefined;
  const candidate = controlled ? value : internalValue;
  const selectedValue = options.some(
    (option) => option.value === candidate && !option.disabled,
  )
    ? candidate
    : first;
  // Resolve identity in the same render as changed options. A removed choice
  // cannot reappear later and silently restore an abandoned selection.
  if (!controlled && internalValue !== selectedValue)
    setInternalValue(selectedValue);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue),
  );
  const safeRadius = Math.max(120, Number.isFinite(radius) ? radius : 280);
  const rowHeight = Math.max(32, Number.isFinite(itemHeight) ? itemHeight : 48);
  const count = Math.max(
    3,
    Number.isFinite(visibleCount) ? Math.floor(visibleCount) : 7,
  );
  const [measurements, setMeasurements] = useState({ width: 0, labelWidth: 0 });
  const labelsKey = JSON.stringify(options.map((option) => option.label));
  const spacing = horizontal
    ? Math.max(rowHeight, measurements.labelWidth + 16)
    : rowHeight;
  const curveRadius = horizontal
    ? Math.max(safeRadius, spacing * 2)
    : safeRadius;
  const shownCount = horizontal
    ? Math.min(
        count,
        Math.max(1, (measurements.width || count * spacing) / spacing),
      )
    : count;
  const horizontalHeight = Math.ceil(
    Math.max(
      rowHeight * 2,
      curveRadius *
        (1 -
          Math.cos(
            Math.min(1.35, (shownCount * spacing) / (2 * curveRadius)),
          )) +
        rowHeight +
        24,
    ),
  );
  const position = useMotionValue(selectedIndex);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconcileFrame = useRef(0);
  const request = useRef(selectedValue);
  const instant = useRef(false);
  const drag = useRef<{
    id: number;
    coordinate: number;
    position: number;
    lastCoordinate: number;
    time: number;
    velocity: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const focusWithin = useRef(false);
  const optionsKey = JSON.stringify(
    options.map((option) => [option.value, !!option.disabled]),
  );
  const previousOptions = useRef(optionsKey);
  const latest = useRef({
    options,
    selectedIndex,
    selectedValue,
    controlled,
    disabled,
    reducedMotion,
    rowHeight,
    spacing,
    horizontal,
    onValueChange,
  });
  useLayoutEffect(() => {
    latest.current = {
      options,
      selectedIndex,
      selectedValue,
      controlled,
      disabled,
      reducedMotion,
      rowHeight,
      spacing,
      horizontal,
      onValueChange,
    };
    request.current = selectedValue;
  });

  useLayoutEffect(() => {
    if (!horizontal) return;
    // Observe untransformed sizes: animated bounds would change the spacing
    // every frame. Font loading and responsive text sizes still trigger this.
    void optionsKey;
    void labelsKey;
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      const labelWidth = Math.max(
        0,
        ...Array.from(buttons.current.values(), (button) => button.offsetWidth),
      );
      setMeasurements((previous) =>
        previous.width === width && previous.labelWidth === labelWidth
          ? previous
          : { width, labelWidth },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const button of buttons.current.values()) observer.observe(button);
    measure();
    return () => observer.disconnect();
  }, [horizontal, optionsKey, labelsKey]);

  const stop = useCallback(() => {
    animation.current?.stop();
    animation.current = null;
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    wheelTimer.current = null;
    cancelAnimationFrame(reconcileFrame.current);
  }, []);

  const settle = useCallback(
    (index: number, immediate = false) => {
      animation.current?.stop();
      if (immediate || latest.current.reducedMotion) position.jump(index);
      else animation.current = animate(position, index, SPRING_LAYOUT);
    },
    [position],
  );

  useLayoutEffect(() => {
    // Changing sides or measured spacing ends a gesture on its old axis.
    void side;
    void spacing;
    stop();
    drag.current = null;
    if (previousOptions.current !== optionsKey) {
      previousOptions.current = optionsKey;
      suppressClick.current = false;
    }
    const index = Math.max(
      0,
      latest.current.options.findIndex(
        (option) => option.value === selectedValue,
      ),
    );
    settle(index, instant.current || disabled || !!reducedMotion);
    instant.current = false;
    if (focusWithin.current && selectedValue !== undefined && !disabled) {
      buttons.current.get(selectedValue)?.focus({ preventScroll: true });
    }
  }, [
    selectedValue,
    optionsKey,
    side,
    spacing,
    disabled,
    reducedMotion,
    settle,
    stop,
  ]);

  const select = useCallback(
    (index: number, keyboard = false) => {
      const current = latest.current;
      const option = current.options[index];
      if (!option || option.disabled || current.disabled) return;
      stop();
      const previousRequest = request.current;
      request.current = option.value;
      instant.current = keyboard;
      if (!current.controlled) setInternalValue(option.value);
      if (option.value !== previousRequest)
        current.onValueChange?.(option.value);
      if (keyboard) {
        position.jump(index);
        buttons.current.get(option.value)?.focus({ preventScroll: true });
      }
      // Reconcile even if a controlled consumer rejects this request, or the
      // release lands on the already-selected row and causes no React render.
      reconcileFrame.current = requestAnimationFrame(() => {
        request.current = latest.current.selectedValue;
        settle(latest.current.selectedIndex, keyboard);
        if (
          keyboard &&
          latest.current.selectedValue !== option.value &&
          latest.current.selectedValue !== undefined
        ) {
          buttons.current
            .get(latest.current.selectedValue)
            ?.focus({ preventScroll: true });
        }
      });
    },
    [position, settle, stop],
  );

  const nearestEnabled = useCallback((at: number) => {
    let nearest = -1;
    let distance = Infinity;
    latest.current.options.forEach((option, index) => {
      if (!option.disabled && Math.abs(index - at) < distance) {
        nearest = index;
        distance = Math.abs(index - at);
      }
    });
    return nearest;
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      const current = latest.current;
      if (
        current.disabled ||
        event.ctrlKey ||
        !current.options.some((option) => !option.disabled)
      )
        return;
      const useX = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!current.horizontal && useX) return;
      const delta =
        (current.horizontal && useX ? event.deltaX : event.deltaY) *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? current.horizontal
              ? element.clientWidth
              : element.clientHeight
            : 1);
      if (!delta) return;
      const last = current.options.length - 1;
      const from = position.get();
      // At an end, release wheel events back to the page's own scroll.
      if ((from <= 0 && delta < 0) || (from >= last && delta > 0)) return;
      event.preventDefault();
      animation.current?.stop();
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      if (current.reducedMotion) {
        const enabled = current.options
          .map((option, index) => ({ option, index }))
          .filter(({ option }) => !option.disabled);
        const at = enabled.findIndex(
          ({ option }) => option.value === request.current,
        );
        const next =
          enabled[clamp(at + Math.sign(delta), 0, enabled.length - 1)];
        if (next) select(next.index, true);
      } else {
        position.set(clamp(from + delta / current.spacing, 0, last));
        wheelTimer.current = setTimeout(
          () => select(nearestEnabled(position.get())),
          WHEEL_SETTLE_MS,
        );
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", wheel);
      stop();
    };
  }, [nearestEnabled, position, select, stop]);

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const enabled = options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !option.disabled);
    if (!enabled.length) return;
    const at = Math.max(
      0,
      enabled.findIndex(({ option }) => option.value === request.current),
    );
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = at + (event.shiftKey ? 5 : 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = at - (event.shiftKey ? 5 : 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = enabled.length - 1;
        break;
      case "PageDown":
        next = at + 5;
        break;
      case "PageUp":
        next = at - 5;
        break;
      default:
        return;
    }
    event.preventDefault();
    const option = enabled[clamp(next, 0, enabled.length - 1)];
    if (option) select(option.index, true);
  };

  const release = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (root.current?.hasPointerCapture(event.pointerId))
      root.current.releasePointerCapture(event.pointerId);
    if (!current.moved) return;
    suppressClick.current = true;
    if (cancelled) settle(latest.current.selectedIndex);
    else {
      const velocity =
        performance.now() - current.time > 100 ? 0 : current.velocity;
      select(
        nearestEnabled(
          position.get() + (reducedMotion ? 0 : velocity * COAST_SECONDS),
        ),
      );
    }
  };

  return (
    <div
      {...props}
      ref={root}
      role="radiogroup"
      aria-label={label}
      aria-describedby={[describedBy, instructionsId].filter(Boolean).join(" ")}
      aria-disabled={disabled || undefined}
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      data-slot="arc-picker"
      data-side={side}
      className={cn(
        "relative w-full min-w-0 cursor-grab select-none overflow-hidden active:cursor-grabbing",
        disabled && "cursor-default opacity-50",
        className,
      )}
      style={{
        touchAction: horizontal ? "pan-y pinch-zoom" : "pan-x pinch-zoom",
        height: horizontal ? horizontalHeight : count * rowHeight,
        maskImage: `linear-gradient(to ${horizontal ? "right" : "bottom"}, transparent, black 12%, black 88%, transparent)`,
        ...style,
      }}
      onKeyDown={keyboard}
      onFocusCapture={(event) => {
        focusWithin.current = true;
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (event.relatedTarget && !root.current?.contains(event.relatedTarget))
          focusWithin.current = false;
        onBlurCapture?.(event);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          selectedValue === undefined ||
          event.button !== 0 ||
          !event.isPrimary
        )
          return;
        stop();
        suppressClick.current = false;
        const coordinate = horizontal ? event.clientX : event.clientY;
        drag.current = {
          id: event.pointerId,
          coordinate,
          position: position.get(),
          lastCoordinate: coordinate,
          time: performance.now(),
          velocity: 0,
          moved: false,
        };
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const current = drag.current;
        if (
          event.defaultPrevented ||
          !current ||
          current.id !== event.pointerId
        )
          return;
        const coordinate = horizontal ? event.clientX : event.clientY;
        const delta = coordinate - current.coordinate;
        if (!current.moved && Math.abs(delta) < 6) return;
        current.moved = true;
        root.current?.setPointerCapture(event.pointerId);
        const now = performance.now();
        const elapsed = Math.max(8, now - current.time);
        current.velocity =
          current.velocity * 0.35 +
          ((current.lastCoordinate - coordinate) / spacing / elapsed) *
            1000 *
            0.65;
        current.lastCoordinate = coordinate;
        current.time = now;
        const next = clamp(
          current.position - delta / spacing,
          0,
          Math.max(0, options.length - 1),
        );
        position.set(reducedMotion ? Math.round(next) : next);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        release(event, false);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        release(event, true);
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        release(event, true);
      }}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        if (suppressClick.current && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <span id={instructionsId} className="sr-only">
        Drag {horizontal ? "horizontally" : "vertically"} or scroll to choose.
        Use arrow keys to move, Home and End to jump.
      </span>
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue ?? ""}
          disabled={disabled}
        />
      )}
      {options.map((option, index) => (
        <ArcOption
          key={option.value}
          option={option}
          index={index}
          position={position}
          radius={curveRadius}
          itemHeight={spacing}
          visibleCount={shownCount}
          side={side}
          selected={option.value === selectedValue}
          disabled={disabled}
          setRef={(element) => {
            if (element) buttons.current.set(option.value, element);
            else buttons.current.delete(option.value);
          }}
          onSelect={() => select(index)}
        />
      ))}
      {!options.length && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No options
        </span>
      )}
    </div>
  );
}
