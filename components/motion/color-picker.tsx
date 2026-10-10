"use client";

import { Pipette } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  type MotionValue,
  motion,
  type Transition,
  useAnimate,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  Children,
  type ComponentPropsWithRef,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_GLIDE, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { PresenceGate } from "@/lib/presence-gate";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

/** Hue 0-360, saturation and value 0-100, alpha 0-1. */
export type Hsva = { h: number; s: number; v: number; a: number };
/** Channels 0-255, alpha 0-1. */
export type Rgba = { r: number; g: number; b: number; a: number };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, places = 0) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const sat = s / 100;
  const val = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a };
}

/** `previous` keeps hue for greys and saturation for black, which RGB cannot carry. */
export function rgbaToHsva({ r, g, b, a }: Rgba, previous?: Hsva): Hsva {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  let h = previous?.h ?? 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const v = max * 100;
  const s = max ? (d / max) * 100 : (previous?.s ?? 0);
  return { h, s, v, a };
}

const HEX_PATTERN = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parses #rgb, #rgba, #rrggbb and #rrggbbaa. Returns null for anything else. */
export function parseHex(input: string): Rgba | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
  const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? round(n(6) / 255, 2) : 1 };
}

/** Lowercase #rrggbb, or #rrggbbaa when the color is translucent. */
export function formatHex({ r, g, b, a }: Rgba): string {
  const pair = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${pair(r)}${pair(g)}${pair(b)}${a < 1 ? pair(a * 255) : ""}`;
}

function hsvToHsl({ h, s, v }: Hsva) {
  const sv = s / 100;
  const vv = v / 100;
  const l = vv * (1 - sv / 2);
  const sl = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100 };
}

function hslToHsv(h: number, s: number, l: number, previous: Hsva, a: number): Hsva {
  const sl = s / 100;
  const ll = l / 100;
  const v = ll + sl * Math.min(ll, 1 - ll);
  return { h, s: v ? 2 * (1 - ll / v) * 100 : previous.s, v: v * 100, a };
}

const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type ColorPickerContextValue = {
  id: string;
  hsva: Hsva;
  rgba: Rgba;
  hex: string;
  alpha: boolean;
  disabled: boolean;
  update: (next: Hsva) => void;
  commit: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

function usePickerContext(component: string) {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error(`${component} must be used within ColorPicker`);
  return context;
}

/** Current color and a setter, for custom parts inside a ColorPicker. */
export function useColorPicker() {
  const { hex, rgba, hsva, alpha, disabled, update, commit } = usePickerContext("useColorPicker");
  return {
    hex,
    rgba,
    hsva,
    alpha,
    disabled,
    /** Accepts any hex form. Invalid input is ignored. */
    setColor: (value: string) => {
      const parsed = parseHex(value);
      if (!parsed) return;
      update(rgbaToHsva(parsed, hsva));
      commit();
    },
  };
}

export interface ColorPickerProps
  extends Omit<ComponentPropsWithRef<"fieldset">, "onChange" | "defaultValue"> {
  /** Controlled hex color (#rgb, #rrggbb or #rrggbbaa). */
  value?: string;
  defaultValue?: string;
  /** Fires on every change while dragging or typing, with a lowercase hex. */
  onValueChange?: (value: string) => void;
  /** Fires once an interaction settles: pointer release, key, preset or field commit. */
  onValueCommit?: (value: string) => void;
  /** Allow transparency. When false the value is always opaque. Default true. */
  alpha?: boolean;
  /** Submits the hex value with a form under this name. */
  name?: string;
  /** Controlled open state for ColorPickerTrigger + ColorPickerContent. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Give it an aria-label, or a legend through children. */
export function ColorPicker({
  value,
  defaultValue = "#3478f6",
  onValueChange,
  onValueCommit,
  alpha = true,
  disabled = false,
  name,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  form,
  className,
  children,
  ...props
}: ColorPickerProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const open = openProp ?? openInternal;
  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (openProp === undefined) setOpenInternal(next);
    onOpenChange?.(next);
  };
  const controlled = value !== undefined;
  const incoming = controlled ? value : defaultValue;
  const [state, setState] = useState(() => ({
    source: incoming,
    hsva: rgbaToHsva(parseHex(incoming) ?? BLACK),
  }));

  // A controlled value the picker did not emit itself is re-read here, during
  // render, so the thumbs never paint a stale color for a frame.
  let hsva = state.hsva;
  if (controlled && value !== state.source) {
    const parsed = parseHex(value);
    hsva = parsed ? rgbaToHsva(parsed, state.hsva) : state.hsva;
    setState({ source: value, hsva });
  }
  if (!alpha && hsva.a !== 1) hsva = { ...hsva, a: 1 };

  const rgba = hsvaToRgba(hsva);
  const hex = formatHex(rgba);
  // Event handlers read the latest emitted hex, which may be ahead of render.
  const hexRef = useRef(hex);
  useLayoutEffect(() => {
    hexRef.current = hex;
  }, [hex]);

  const update = (next: Hsva) => {
    const clean: Hsva = {
      h: clamp(next.h, 0, 360),
      s: clamp(next.s, 0, 100),
      v: clamp(next.v, 0, 100),
      a: alpha ? clamp(next.a, 0, 1) : 1,
    };
    const nextHex = formatHex(hsvaToRgba(clean));
    const changed = nextHex !== hexRef.current;
    hexRef.current = nextHex;
    setState({ source: nextHex, hsva: clean });
    if (changed) onValueChange?.(nextHex);
  };

  return (
    <ColorPickerContext.Provider
      value={{
        id,
        hsva,
        rgba,
        hex,
        alpha,
        disabled,
        update,
        commit: () => onValueCommit?.(hexRef.current),
        open,
        setOpen,
        triggerRef,
      }}
    >
      <fieldset
        {...props}
        disabled={disabled}
        form={form}
        className={cn(
          "relative flex w-full min-w-0 max-w-72 flex-col gap-3 border-0 p-0",
          // Holding a trigger, the root is just the trigger's box, so the panel
          // anchors under it even inside a stretching flex or grid parent.
          "has-[>[data-color-picker-trigger]]:w-fit has-[>[data-color-picker-trigger]]:self-start",
          disabled && "opacity-50",
          className,
        )}
      >
        {children}
        {name && <input type="hidden" name={name} value={hex} form={form} />}
      </fieldset>
    </ColorPickerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Pointer + spring plumbing shared by the area and the sliders
// ---------------------------------------------------------------------------

function useGlide(target: number) {
  const reduce = useReducedMotion();
  const spring = useSpring(target, SPRING_GLIDE);
  useEffect(() => {
    if (reduce) spring.jump(target);
    else spring.set(target);
  }, [reduce, spring, target]);
  return { spring, offset: useTransform(spring, (n) => `${n}%`) };
}

function useDrag(
  onPoint: (x: number, y: number) => void,
  onEnd: () => void,
  disabled: boolean,
) {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    onPoint(
      clamp((event.clientX - rect.left) / rect.width, 0, 1),
      clamp((event.clientY - rect.top) / rect.height, 0, 1),
    );
  };

  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    releasePointer(event.currentTarget, event.pointerId);
    draggingRef.current = false;
    setDragging(false);
    onEnd();
  };

  return {
    railRef,
    thumbRef,
    dragging,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (disabled || event.button !== 0) return;
        draggingRef.current = true;
        setDragging(true);
        capturePointer(event.currentTarget, event.pointerId);
        thumbRef.current?.focus({ preventScroll: true });
        point(event);
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (draggingRef.current) point(event);
      },
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}

/** Arrow, Page and Home/End stepping. Returns the delta, or null when unhandled. */
function keyStep(event: KeyboardEvent, big: number): { axis: "x" | "y"; delta: number } | "min" | "max" | null {
  const step = event.shiftKey ? big : 1;
  switch (event.key) {
    case "ArrowRight":
      return { axis: "x", delta: step };
    case "ArrowLeft":
      return { axis: "x", delta: -step };
    case "ArrowUp":
      return { axis: "y", delta: step };
    case "ArrowDown":
      return { axis: "y", delta: -step };
    case "PageUp":
      return { axis: "y", delta: big };
    case "PageDown":
      return { axis: "y", delta: -big };
    case "Home":
      return "min";
    case "End":
      return "max";
    default:
      return null;
  }
}

const CHECKERBOARD =
  "repeating-conic-gradient(#d4d4d8 0% 25%, #fafafa 0% 50%) 0 0 / 8px 8px";

// The loupe lifts with a visible overshoot so it reads as picked up, unlike
// the critically damped glide the thumb itself rides on.
const LOUPE_LIFT: Transition = { type: "spring", stiffness: 520, damping: 24, mass: 0.6 };
const LOUPE_DROP: Transition = { duration: 0.12, ease: EASE_OUT };
// Glide velocity in %/s mapped to a pendulum swing, so the loupe trails the drag.
const LOUPE_TILT_INPUT = [-400, 400];
const LOUPE_TILT_DEGREES = [16, -16];

function Thumb({
  thumbRef,
  dragging,
  color,
  glide,
  x,
  y,
  className,
  ...props
}: ComponentPropsWithRef<"div"> & {
  thumbRef: RefObject<HTMLDivElement | null>;
  dragging: boolean;
  color: string;
  /** Horizontal glide spring, read for the loupe's tilt. */
  glide: MotionValue<number>;
  x: MotionValue<string>;
  y?: MotionValue<string>;
}) {
  const reduce = useReducedMotion();
  const velocity = useVelocity(glide);
  const tilt = useSpring(
    useTransform(velocity, LOUPE_TILT_INPUT, LOUPE_TILT_DEGREES, { clamp: true }),
    SPRING_PRESS,
  );
  const lifted = dragging && !reduce;
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ x, y }}>
      <div
        {...props}
        ref={thumbRef}
        className={cn(
          "absolute left-0 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none",
          y ? "top-0" : "top-1/2",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          className,
        )}
      >
        <motion.span
          aria-hidden="true"
          animate={{ scale: lifted ? 0.78 : 1 }}
          transition={SPRING_PRESS}
          className="block size-full rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_2px_6px_rgb(0_0_0/0.25)]"
          style={{ backgroundColor: color }}
        />
        <AnimatePresence>
          {lifted && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 -ml-5 block size-10"
              style={{ rotate: tilt, originX: 0.5, originY: 1.3 }}
              initial={{ opacity: 0, scale: 0.3, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: LOUPE_LIFT }}
              exit={{ opacity: 0, scale: 0.3, y: 16, transition: LOUPE_DROP }}
            >
              {/* A square with one sharp corner, turned so the point aims at the thumb. */}
              <span
                className="absolute inset-0 -rotate-45 overflow-hidden rounded-[50%_50%_50%_0] border-[3px] border-white shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_6px_16px_rgb(0_0_0/0.28)]"
                style={{ background: CHECKERBOARD }}
              >
                <span className="absolute inset-0" style={{ background: color }} />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Saturation / brightness area
// ---------------------------------------------------------------------------

export interface ColorPickerAreaProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Accessible name for the 2D thumb. Default "Saturation and brightness". */
  label?: string;
}

// One surface: the trigger chip grows into the area and shrinks back into it.
const MORPH: Transition = { type: "spring", duration: 0.5, bounce: 0.2 };
const AREA_RADIUS = 12;
const CHIP_RADIUS = 6;

/** True inside ColorPickerContent, where the area morphs out of the trigger chip. */
const MorphContext = createContext(false);

export function ColorPickerArea({ label = "Saturation and brightness", className, style, ...props }: ColorPickerAreaProps) {
  const { id, hsva, rgba, hex, disabled, update, commit, open } = usePickerContext("ColorPickerArea");
  const morph = useContext(MorphContext);
  const reduce = useReducedMotion();
  const { railRef, thumbRef, dragging, handlers } = useDrag(
    (x, y) => update({ ...hsva, s: x * 100, v: (1 - y) * 100 }),
    commit,
    disabled,
  );
  const x = useGlide(hsva.s);
  const y = useGlide(100 - hsva.v);
  const s = Math.round(hsva.s);
  const v = Math.round(hsva.v);
  const morphing = morph && !reduce;
  const rgb = `rgb(${rgba.r} ${rgba.g} ${rgba.b})`;

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      {...handlers}
      ref={railRef}
      layoutId={morphing ? `${id}-chip` : undefined}
      // Measure only when open flips: every drag frame would otherwise force a
      // layout read, and the close render must snapshot so the chip can morph
      // back from here and the exit can finish.
      layoutDependency={open}
      transition={MORPH}
      className={cn(
        "relative h-40 w-full touch-none",
        TOUCH_GESTURE_CLASS,
        disabled ? "cursor-not-allowed" : "cursor-crosshair",
        className,
      )}
      style={{
        ...style,
        borderRadius: AREA_RADIUS,
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h} 100% 50%))`,
      }}
    >
      {/* Arriving from the chip, the solid color dissolves to reveal the spectrum behind it. */}
      {morphing && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundColor: hex }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.06 }}
        />
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-black/10 ring-inset" />
      <motion.div
        className="absolute inset-0"
        initial={morphing ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.22 }}
      >
        <Thumb
          thumbRef={thumbRef}
          dragging={dragging}
          color={rgb}
          glide={x.spring}
          x={x.offset}
          y={y.offset}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-roledescription="2D slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={s}
          aria-valuetext={`Saturation ${s}%, brightness ${v}%`}
          aria-disabled={disabled || undefined}
          onKeyDown={(event) => {
            if (disabled) return;
            const step = keyStep(event, 10);
            if (!step) return;
            event.preventDefault();
            if (step === "min") update({ ...hsva, s: 0 });
            else if (step === "max") update({ ...hsva, s: 100 });
            else if (step.axis === "x") update({ ...hsva, s: hsva.s + step.delta });
            else update({ ...hsva, v: hsva.v + step.delta });
            commit();
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Hue and alpha sliders
// ---------------------------------------------------------------------------

function ChannelSlider({
  value,
  max,
  onValue,
  label,
  valueText,
  background,
  thumbColor,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"div">, "children"> & {
  value: number;
  max: number;
  onValue: (next: number) => void;
  label: string;
  valueText: string;
  background: string;
  thumbColor: string;
}) {
  const { disabled, commit } = usePickerContext("ColorPicker slider");
  const { railRef, thumbRef, dragging, handlers } = useDrag((x) => onValue(x * max), commit, disabled);
  const x = useGlide((value / max) * 100);

  return (
    <div
      {...props}
      {...handlers}
      className={cn(
        "relative h-3.5 w-full touch-none rounded-full",
        TOUCH_GESTURE_CLASS,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      style={{ background }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black/10 ring-inset" />
      {/* The rail is inset by half a thumb so the thumb never leaves the rounded track. */}
      <div ref={railRef} className="absolute inset-y-0 right-[9px] left-[9px]">
        <Thumb
          thumbRef={thumbRef}
          dragging={dragging}
          color={thumbColor}
          glide={x.spring}
          x={x.offset}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.round(value)}
          aria-valuetext={valueText}
          aria-disabled={disabled || undefined}
          onKeyDown={(event) => {
            if (disabled) return;
            const step = keyStep(event, 10);
            if (!step) return;
            event.preventDefault();
            if (step === "min") onValue(0);
            else if (step === "max") onValue(max);
            else onValue(Math.round(value) + step.delta);
            commit();
          }}
        />
      </div>
    </div>
  );
}

export interface ColorPickerHueProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label?: string;
}

export function ColorPickerHue({ label = "Hue", ...props }: ColorPickerHueProps) {
  const { hsva, update } = usePickerContext("ColorPickerHue");
  const h = Math.round(hsva.h);
  return (
    <ChannelSlider
      {...props}
      value={hsva.h}
      max={360}
      onValue={(next) => update({ ...hsva, h: next })}
      label={label}
      valueText={`${h} degrees`}
      background="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
      thumbColor={`hsl(${hsva.h} 100% 50%)`}
    />
  );
}

export interface ColorPickerAlphaProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label?: string;
}

/** Renders nothing when the picker has `alpha={false}`. */
export function ColorPickerAlpha({ label = "Opacity", ...props }: ColorPickerAlphaProps) {
  const { hsva, rgba, alpha, update } = usePickerContext("ColorPickerAlpha");
  if (!alpha) return null;
  const rgb = `${rgba.r} ${rgba.g} ${rgba.b}`;
  const percent = Math.round(hsva.a * 100);
  return (
    <ChannelSlider
      {...props}
      value={hsva.a * 100}
      max={100}
      onValue={(next) => update({ ...hsva, a: Math.round(next) / 100 })}
      label={label}
      valueText={`${percent}%`}
      background={`linear-gradient(to right, rgb(${rgb} / 0), rgb(${rgb})), ${CHECKERBOARD}`}
      thumbColor={`rgb(${rgb} / ${hsva.a})`}
    />
  );
}

// ---------------------------------------------------------------------------
// Swatch
// ---------------------------------------------------------------------------

export type ColorPickerSwatchProps = Omit<ComponentPropsWithRef<"span">, "children">;

/** The current color over a transparency checkerboard. Decorative. */
export function ColorPickerSwatch({ className, style, ...props }: ColorPickerSwatchProps) {
  const { hex } = usePickerContext("ColorPickerSwatch");
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn("relative block size-9 shrink-0 overflow-hidden rounded-lg", className)}
      style={{ ...style, background: CHECKERBOARD }}
    >
      <span
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] transition-colors duration-150"
        style={{ backgroundColor: hex }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Text fields
// ---------------------------------------------------------------------------

const FIELD_CLASS =
  "h-9 w-full min-w-0 rounded-lg border border-border bg-background text-sm text-foreground tabular-nums outline-none transition-colors focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed";

/** A horizontal shake for rejected input; dropped under reduced motion. */
function useRejectShake() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();
  return {
    scope,
    shake: () => {
      if (reduce || !scope.current) return;
      animate(scope.current, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.3 });
    },
  };
}

export interface ColorPickerHexInputProps
  extends Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "type"> {}

/** Hex field. Updates live once six or eight digits are typed, reverts invalid input on blur. */
export function ColorPickerHexInput({
  className,
  onChange,
  onBlur,
  onKeyDown,
  "aria-label": ariaLabel = "Hex color",
  ...props
}: ColorPickerHexInputProps) {
  const { hsva, hex, update, commit, disabled } = usePickerContext("ColorPickerHexInput");
  const [draft, setDraft] = useState<string | null>(null);
  const { scope, shake } = useRejectShake();

  const settle = () => {
    if (draft === null) return;
    const parsed = parseHex(draft);
    if (parsed) {
      update(rgbaToHsva(parsed, hsva));
      commit();
    } else shake();
    setDraft(null);
  };

  return (
    <div ref={scope} className={cn("relative min-w-0 flex-1", className)}>
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        #
      </span>
      <input
        {...props}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        maxLength={9}
        disabled={disabled}
        aria-label={ariaLabel}
        value={draft ?? hex.slice(1).toUpperCase()}
        onChange={(event) => {
          onChange?.(event);
          const next = event.target.value.replace(/^#/, "");
          setDraft(next);
          // Live preview only for full-length entries, so "abc" mid-way to
          // "abcdef" does not flash a short-form color.
          if (next.length === 6 || next.length === 8) {
            const parsed = parseHex(next);
            if (parsed) update(rgbaToHsva(parsed, hsva));
          }
        }}
        onBlur={(event) => {
          onBlur?.(event);
          settle();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter") settle();
          if (event.key === "Escape" && draft !== null) {
            event.preventDefault();
            setDraft(null);
          }
        }}
        className={cn(FIELD_CLASS, "pr-3 pl-6 font-mono uppercase")}
      />
    </div>
  );
}

type ChannelSpec = { key: string; short: string; name: string; max: number; value: number; set: (n: number) => Hsva };

function ChannelField({ spec }: { spec: ChannelSpec }) {
  const { update, commit, disabled } = usePickerContext("ColorPickerChannels");
  const [draft, setDraft] = useState<string | null>(null);
  const shown = Math.round(spec.value);

  return (
    <label className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-label={spec.name}
        value={draft ?? String(shown)}
        onChange={(event) => {
          const next = event.target.value.replace(/[^\d]/g, "").slice(0, 3);
          setDraft(next);
          if (next !== "") update(spec.set(clamp(Number(next), 0, spec.max)));
        }}
        onBlur={() => {
          if (draft !== null) commit();
          setDraft(null);
        }}
        onKeyDown={(event) => {
          const delta = event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
          if (delta) {
            event.preventDefault();
            setDraft(null);
            update(spec.set(clamp(shown + delta * (event.shiftKey ? 10 : 1), 0, spec.max)));
            commit();
          } else if (event.key === "Enter") {
            setDraft(null);
            commit();
          }
        }}
        className={cn(FIELD_CLASS, "px-1 text-center")}
      />
      <span aria-hidden="true" className="text-[11px] font-medium text-muted-foreground">
        {spec.short}
      </span>
    </label>
  );
}

export interface ColorPickerChannelsProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Which channels to edit. Default "rgb". */
  format?: "rgb" | "hsl";
}

/** Numeric RGB or HSL fields, plus an opacity field when alpha is enabled. Arrow keys nudge. */
export function ColorPickerChannels({ format = "rgb", className, ...props }: ColorPickerChannelsProps) {
  const { hsva, rgba, alpha } = usePickerContext("ColorPickerChannels");
  const fromRgb = (patch: Partial<Rgba>) => rgbaToHsva({ ...rgba, ...patch }, hsva);
  let specs: ChannelSpec[];
  if (format === "hsl") {
    const hsl = hsvToHsl(hsva);
    specs = [
      { key: "h", short: "H", name: "Hue", max: 360, value: hsl.h, set: (n) => hslToHsv(n, hsl.s, hsl.l, hsva, hsva.a) },
      { key: "s", short: "S", name: "Saturation", max: 100, value: hsl.s, set: (n) => hslToHsv(hsl.h, n, hsl.l, hsva, hsva.a) },
      { key: "l", short: "L", name: "Lightness", max: 100, value: hsl.l, set: (n) => hslToHsv(hsl.h, hsl.s, n, hsva, hsva.a) },
    ];
  } else {
    specs = [
      { key: "r", short: "R", name: "Red", max: 255, value: rgba.r, set: (n) => fromRgb({ r: n }) },
      { key: "g", short: "G", name: "Green", max: 255, value: rgba.g, set: (n) => fromRgb({ g: n }) },
      { key: "b", short: "B", name: "Blue", max: 255, value: rgba.b, set: (n) => fromRgb({ b: n }) },
    ];
  }
  if (alpha) {
    specs.push({ key: "a", short: "A", name: "Opacity percent", max: 100, value: hsva.a * 100, set: (n) => ({ ...hsva, a: n / 100 }) });
  }
  return (
    <div {...props} className={cn("flex min-w-0 flex-1 gap-1.5", className)}>
      {specs.map((spec) => (
        <ChannelField key={`${format}-${spec.key}`} spec={spec} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eye dropper
// ---------------------------------------------------------------------------

type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };

export interface ColorPickerEyeDropperProps extends Omit<ComponentPropsWithRef<"button">, "type"> {
  children?: ReactNode;
}

/** Samples a color from the screen. Renders nothing where the EyeDropper API is missing. */
export function ColorPickerEyeDropper({
  className,
  children,
  onClick,
  "aria-label": ariaLabel = "Pick a color from the screen",
  ...props
}: ColorPickerEyeDropperProps) {
  const { hsva, update, commit, disabled } = usePickerContext("ColorPickerEyeDropper");
  const reduce = useReducedMotion();
  const [EyeDropper, setEyeDropper] = useState<EyeDropperConstructor | null>(null);
  useEffect(() => {
    const ctor = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (ctor) setEyeDropper(() => ctor);
  }, []);
  if (!EyeDropper) return null;

  return (
    <motion.button
      {...(props as React.ComponentProps<typeof motion.button>)}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        try {
          const { sRGBHex } = await new EyeDropper().open();
          const parsed = parseHex(sRGBHex);
          if (!parsed) return;
          update(rgbaToHsva({ ...parsed, a: hsva.a }, hsva));
          commit();
        } catch {
          // Dismissed with Escape.
        }
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
        className,
      )}
    >
      {children ?? <Pipette aria-hidden="true" className="size-4" />}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export type ColorPickerPresetsProps = ComponentPropsWithRef<"div">;

export function ColorPickerPresets({ className, children, ...props }: ColorPickerPresetsProps) {
  const { id } = usePickerContext("ColorPickerPresets");
  return (
    <div {...props} className={cn("flex flex-wrap gap-2", className)}>
      <LayoutGroup id={`${id}-presets`}>{children}</LayoutGroup>
    </div>
  );
}

export interface ColorPickerPresetProps
  extends Omit<ComponentPropsWithRef<"button">, "value" | "children" | "type"> {
  /** Hex color this preset applies. */
  value: string;
  /** Accessible color name. Defaults to the hex. */
  label?: string;
}

export function ColorPickerPreset({ value, label, className, onClick, ...props }: ColorPickerPresetProps) {
  const { hsva, hex, update, commit, disabled } = usePickerContext("ColorPickerPreset");
  const reduce = useReducedMotion();
  const parsed = parseHex(value);
  const normalized = parsed ? formatHex(parsed) : value;
  const selected = normalized === hex;

  return (
    <motion.button
      {...(props as React.ComponentProps<typeof motion.button>)}
      type="button"
      disabled={disabled}
      aria-label={label ?? normalized}
      aria-pressed={selected}
      whileTap={reduce || disabled ? undefined : { scale: 0.88 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !parsed) return;
        update(rgbaToHsva(parsed, hsva));
        commit();
      }}
      className={cn(
        "relative size-6 shrink-0 rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground disabled:cursor-not-allowed",
        className,
      )}
    >
      {selected && (
        <motion.span
          aria-hidden="true"
          layoutId={reduce ? undefined : "color-picker-preset"}
          initial={false}
          transition={SPRING_LAYOUT}
          className="pointer-events-none absolute -inset-[3px] rounded-full border-2 border-foreground/70"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ background: CHECKERBOARD }}
      >
        <span
          className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
          style={{ backgroundColor: normalized }}
        />
      </span>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Popover: trigger chip morphs into the area
// ---------------------------------------------------------------------------

export interface ColorPickerTriggerProps extends Omit<ComponentPropsWithRef<"button">, "type"> {
  /** Replaces the hex label beside the chip. */
  children?: ReactNode;
}

/**
 * The hex beside the chip. Its width springs to the text instead of snapping,
 * so the trigger never jumps when the hex gains or drops its alpha pair. Width
 * is a layout property, but this is one small inline box with nothing laid out
 * after it inside the button, and a transform cannot resize the border.
 */
function TriggerLabel({ hex }: { hex: string }) {
  const reduce = useReducedMotion();
  const textRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;
    setWidth(text.offsetWidth);
    const observer = new ResizeObserver(() => setWidth(text.offsetWidth));
    observer.observe(text);
    return () => observer.disconnect();
  }, []);
  const alpha = hex.slice(7);

  return (
    <motion.span
      className="relative inline-flex overflow-hidden"
      initial={false}
      animate={{ width: width ?? "auto" }}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
    >
      <span ref={textRef} className="relative inline-flex shrink-0 whitespace-nowrap font-mono uppercase tabular-nums">
        {hex.slice(0, 7)}
        <AnimatePresence mode="popLayout" initial={false}>
          {alpha && (
            <motion.span
              key="alpha"
              className="text-muted-foreground"
              initial={{ opacity: 0, x: reduce ? 0 : -4, filter: reduce ? "blur(0px)" : "blur(3px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(3px)", transition: { duration: 0.12 } }}
              transition={SPRING_LAYOUT}
            >
              {alpha}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

/** Opens ColorPickerContent. Its color chip is the surface that grows into the area. */
export function ColorPickerTrigger({ className, children, onClick, ...props }: ColorPickerTriggerProps) {
  const { id, hex, open, setOpen, triggerRef, disabled } = usePickerContext("ColorPickerTrigger");
  const reduce = useReducedMotion();
  return (
    <button
      {...props}
      ref={triggerRef}
      type="button"
      data-color-picker-trigger=""
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? `${id}-content` : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      className={cn(
        "inline-flex h-10 w-fit items-center gap-2.5 rounded-xl border border-border bg-background pr-3.5 pl-2.5 text-sm text-foreground outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
        className,
      )}
    >
      <span aria-hidden="true" className="relative size-6 shrink-0">
        {/* The chip's empty socket while it is out being the area. */}
        <span className="absolute inset-0 rounded-md border border-dashed border-foreground/20" />
        {!open && (
          <motion.span
            layoutId={reduce ? undefined : `${id}-chip`}
            transition={MORPH}
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: CHIP_RADIUS, background: CHECKERBOARD }}
          >
            <span
              className="absolute inset-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
              style={{ backgroundColor: hex, borderRadius: CHIP_RADIUS }}
            />
          </motion.span>
        )}
      </span>
      {children ?? <TriggerLabel hex={hex} />}
    </button>
  );
}

export interface ColorPickerContentProps extends Omit<ComponentPropsWithRef<"div">, "role"> {
  /** Edge of the trigger the panel lines up with. Default "start". */
  align?: "start" | "end";
}

/** Minimum gap between the panel and the viewport edge, in px. */
const VIEWPORT_GUTTER = 8;

// Each layer owns its enter and exit values instead of inheriting them from
// the panel. Reopening during the close cancels the exit per element, and an
// element only returns to its enter state if that state is its own.
const PANEL_DELAY = 0.1;
const PANEL_STAGGER = 0.035;

const PANEL_ITEM = {
  initial: { opacity: 0, y: -6, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const PANEL_ITEM_REDUCED = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const PANEL_ITEM_EXIT = { opacity: 0, transition: { duration: 0.1 } };

/**
 * Panel opened by ColorPickerTrigger, laid out under it. A ColorPickerArea
 * placed directly inside grows out of the trigger chip; the other children
 * stagger in behind it. Closes on outside press and Escape.
 */
export function ColorPickerContent({ align = "start", className, children, ...props }: ColorPickerContentProps) {
  const { id, open, setOpen, triggerRef } = usePickerContext("ColorPickerContent");
  const reduce = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep the panel on screen horizontally. Written before paint, and before
  // motion measures the area, so the chip morphs to where the panel really is.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panel.style.marginLeft = "0px";
    const rect = panel.getBoundingClientRect();
    const max = document.documentElement.clientWidth - VIEWPORT_GUTTER;
    let shift = 0;
    if (rect.right > max) shift = max - rect.right;
    if (rect.left + shift < VIEWPORT_GUTTER) shift = VIEWPORT_GUTTER - rect.left;
    panel.style.marginLeft = `${shift}px`;
  }, [open]);
  useDismiss(open, () => setOpen(false), panelRef, {
    ignore: (target) => Boolean(triggerRef.current?.contains(target)),
  });

  // Hand focus in on open, and back to the trigger when it closes from inside.
  // Skipped on mount, so a picker that starts open does not steal page focus.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (open) {
      panelRef.current
        ?.querySelector<HTMLElement>(
          '[role="slider"]:not([aria-disabled]), input:not(:disabled), button:not(:disabled)',
        )
        ?.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement;
    if (!active || active === document.body || panelRef.current?.contains(active)) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <PresenceGate>
          {({ gate }) => {
            // Counted per render, for stagger delays only; keys come from Children.map.
            let row = 0;
            return (
            <motion.div
              {...(props as React.ComponentProps<typeof motion.div>)}
              {...gate}
              ref={panelRef}
              id={`${id}-content`}
              role="dialog"
              aria-label={props["aria-label"] ?? "Color picker"}
              className={cn(
                "absolute top-full z-50 mt-2 flex w-72 flex-col gap-3 p-3",
                align === "end" ? "right-0" : "left-0",
                className,
              )}
            >
              {/* The surface fades on its own layer so the morphing area is never faded with it. */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-2xl border border-border bg-background shadow-[0_12px_32px_-8px_rgb(0_0_0/0.25)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: EASE_OUT, delay: PANEL_DELAY }}
              />
              <MorphContext.Provider value>
                {/* Children.map keys each wrapper from its child, stable across the exit render. */}
                {Children.map(children, (child) => {
                  if (isValidElement(child) && child.type === ColorPickerArea) return child;
                  row += 1;
                  const item = reduce ? PANEL_ITEM_REDUCED : PANEL_ITEM;
                  return (
                    <motion.div
                      initial={item.initial}
                      animate={item.animate}
                      exit={PANEL_ITEM_EXIT}
                      transition={{ ...SPRING_LAYOUT, delay: PANEL_DELAY + row * PANEL_STAGGER }}
                    >
                      {child}
                    </motion.div>
                  );
                })}
              </MorphContext.Provider>
            </motion.div>
            );
          }}
        </PresenceGate>
      )}
    </AnimatePresence>
  );
}
