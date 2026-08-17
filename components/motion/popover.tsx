"use client";

import {
  animate,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePopoverPortalPosition } from "@/components/motion/popover-position";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import {
  type HoverGesture,
  useHoverGesture,
} from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";
type TriggerMode = "click" | "hover";

// This morph needs less bounce than layout motion: too much overshoot makes
// the liquid neck balloon past the final panel edges.
const GOO_OPEN_SPRING = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.15,
} as const;
const GOO_CLOSE_SPRING = {
  type: "spring",
  visualDuration: 0.21,
  bounce: 0.15,
} as const;
const HOVER_CLOSE_DELAY = 120;
const CIRCLE_KAPPA = 0.5523;

// `onPointerEnter`/`onPointerLeave` rather than the mouse pair: a tap fires
// compatibility mouseenter/mouseleave that carry no pointerType at all, and
// they are what made the panel flicker open and shut under a finger. The
// gesture pairs the two, so the panel a pen tap opened is not closed again by
// the boundary event that ends the same tap.
function makeHoverHandlers(
  hover: HoverGesture,
  enter: () => void,
  leave: () => void,
) {
  return {
    onPointerEnter: (event: React.PointerEvent) => {
      if (hover.enter(event)) enter();
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (hover.leave(event)) leave();
    },
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}
interface Geo {
  layerW: number;
  layerH: number;
  left: number;
  top: number;
  trigger: Rect;
  panel: Rect;
}

// Trigger rect and panel rect in a shared local coordinate box.
function buildGeo(
  tW: number,
  tH: number,
  cW: number,
  cH: number,
  side: Side,
  align: Align,
  gap: number,
  panelRadius: number,
): Geo {
  const py = side === "bottom" ? tH + gap : -(gap + cH);
  const px = align === "start" ? 0 : align === "end" ? tW - cW : (tW - cW) / 2;

  const left = Math.min(0, px);
  const top = Math.min(0, py);
  const layerW = Math.max(tW, px + cW) - left;
  const layerH = Math.max(tH, py + cH) - top;

  const triggerRadius = Math.min(tH / 2, panelRadius);

  return {
    layerW,
    layerH,
    left,
    top,
    trigger: { x: -left, y: -top, w: tW, h: tH, r: triggerRadius },
    panel: { x: px - left, y: py - top, w: cW, h: cH, r: panelRadius },
  };
}

function rectAtProgress(geo: Geo, progress: number): Rect {
  const trigger = geo.trigger;
  const panel = geo.panel;

  return {
    x: lerp(trigger.x, panel.x, progress),
    y: lerp(trigger.y, panel.y, progress),
    w: lerp(trigger.w, panel.w, progress),
    h: lerp(trigger.h, panel.h, progress),
    r: lerp(trigger.r, panel.r, progress),
  };
}

function insetFor(rect: Rect, layerW: number, layerH: number) {
  const top = rect.y;
  const right = layerW - (rect.x + rect.w);
  const bottom = layerH - (rect.y + rect.h);
  const left = rect.x;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${rect.r}px)`;
}

function roundedRectShape(rect: Rect) {
  const radius = Math.max(0, Math.min(rect.r, rect.w / 2, rect.h / 2));
  const control = radius * CIRCLE_KAPPA;
  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.w;
  const y2 = rect.y + rect.h;
  const px = (value: number) => `${value.toFixed(3)}px`;

  return (
    `shape(from ${px(x1 + radius)} ${px(y1)}, ` +
    `line to ${px(x2 - radius)} ${px(y1)}, ` +
    `curve to ${px(x2)} ${px(y1 + radius)} with ${px(x2 - radius + control)} ${px(y1)} / ${px(x2)} ${px(y1 + radius - control)}, ` +
    `line to ${px(x2)} ${px(y2 - radius)}, ` +
    `curve to ${px(x2 - radius)} ${px(y2)} with ${px(x2)} ${px(y2 - radius + control)} / ${px(x2 - radius + control)} ${px(y2)}, ` +
    `line to ${px(x1 + radius)} ${px(y2)}, ` +
    `curve to ${px(x1)} ${px(y2 - radius)} with ${px(x1 + radius - control)} ${px(y2)} / ${px(x1)} ${px(y2 - radius + control)}, ` +
    `line to ${px(x1)} ${px(y1 + radius)}, ` +
    `curve to ${px(x1 + radius)} ${px(y1)} with ${px(x1)} ${px(y1 + radius - control)} / ${px(x1 + radius - control)} ${px(y1)}, ` +
    "close)"
  );
}

function clipForProgress(geo: Geo, progress: number, supportsShape: boolean) {
  const rect = rectAtProgress(geo, progress);
  return supportsShape
    ? roundedRectShape(rect)
    : insetFor(rect, geo.layerW, geo.layerH);
}

function roundedRectPath(rect: Rect) {
  const radius = Math.max(0, Math.min(rect.r, rect.w / 2, rect.h / 2));
  const n = (value: number) => value.toFixed(3);
  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.w;
  const y2 = rect.y + rect.h;
  const arc = `A${n(radius)} ${n(radius)} 0 0 1`;

  // A zero radius makes every arc degenerate to a line, so this also draws
  // plain rectangles.
  return (
    `M${n(x1 + radius)} ${n(y1)}` +
    `H${n(x2 - radius)}${arc} ${n(x2)} ${n(y1 + radius)}` +
    `V${n(y2 - radius)}${arc} ${n(x2 - radius)} ${n(y2)}` +
    `H${n(x1 + radius)}${arc} ${n(x1)} ${n(y2 - radius)}` +
    `V${n(y1 + radius)}${arc} ${n(x1 + radius)} ${n(y1)}Z`
  );
}

// The goo layer is portalled above the page, so its copy of the trigger pill
// would cover the real trigger's label and focus ring. Punching the trigger
// back out keeps the real one visible and clips the blur to the layer box.
// This is a clip path rather than a CSS mask on purpose: WebKit silently
// ignores `mask: url(#id)` pointing at an SVG <mask> element, which left the
// label hidden behind the goo in Safari.
function triggerCutout(geo: Geo) {
  const layer = { x: 0, y: 0, w: geo.layerW, h: geo.layerH, r: 0 };
  return `path(evenodd, "${roundedRectPath(layer)} ${roundedRectPath(geo.trigger)}")`;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  openHover: () => void;
  scheduleClose: () => void;
  triggerMode: TriggerMode;
  side: Side;
  align: Align;
  gap: number;
  panelRadius: number;
  gooStrength: number;
  reduce: boolean;
  gooId: string;
  contentId: string;
  progress: MotionValue<number>;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`${component} must be used within <Popover>`);
  return ctx;
}

export interface PopoverProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** How the popover is summoned. Default "click". */
  trigger?: TriggerMode;
  /** Which side of the trigger the panel oozes out of. Default "bottom". */
  side?: Side;
  /** Alignment along the trigger's edge. Default "center". */
  align?: Align;
  /** Gap between trigger and panel, in px — the length of the gooey neck. Default 14. */
  sideOffset?: number;
  /** Corner radius of the open panel, in px. Default 16. */
  panelRadius?: number;
  /** Blur radius feeding the goo filter — higher melts more. Default 8. */
  gooStrength?: number;
  className?: string;
}

export function Popover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  trigger = "click",
  side = "bottom",
  align = "center",
  sideOffset = 14,
  panelRadius = 16,
  gooStrength = 8,
  className,
}: PopoverProps) {
  const reduce = useReducedMotion() ?? false;
  const gooId = useId().replace(/:/g, "");
  const contentId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootHover = useHoverGesture();
  const progress = useMotionValue(defaultOpen ? 1 : 0);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openHover = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose, setOpen]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  }, [cancelClose, setOpen]);

  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    const animation = animate(
      progress,
      open ? 1 : 0,
      reduce
        ? { duration: 0 }
        : open
          ? GOO_OPEN_SPRING
          : GOO_CLOSE_SPRING,
    );
    return () => animation.stop();
  }, [open, progress, reduce]);

  // The panel is a `role="dialog"` and goes inert the moment it closes, so
  // focus cannot be left sitting inside it: Escape hands it back to the
  // trigger, the way the ARIA dialog pattern asks. A pointer dismissal takes
  // the focus onward itself when it lands on something focusable — this only
  // catches the case where it would otherwise be stranded.
  const close = useCallback(() => {
    setOpen(false);
    const focused = document.activeElement;
    const inPanel =
      focused instanceof HTMLElement && contentRef.current?.contains(focused);
    if (inPanel) triggerRef.current?.focus();
  }, [setOpen]);
  // The panel is portalled, so both trees participate in outside detection.
  const ignoreContent = useCallback(
    (target: Element) => Boolean(contentRef.current?.contains(target)),
    [],
  );
  // A hover trigger opens on tap as well now, so it needs the same outside
  // dismissal the click trigger always had. The gesture passes through to
  // whatever it landed on, which is the light-dismiss bargain the platform's
  // own popovers strike.
  useDismiss(open, close, rootRef, { ignore: ignoreContent });

  const ctx = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      openHover,
      scheduleClose,
      triggerMode: trigger,
      side,
      align,
      gap: sideOffset,
      panelRadius,
      gooStrength,
      reduce,
      gooId,
      contentId,
      progress,
      triggerRef,
      contentRef,
    }),
    [
      open,
      setOpen,
      toggle,
      openHover,
      scheduleClose,
      trigger,
      side,
      align,
      sideOffset,
      panelRadius,
      gooStrength,
      reduce,
      gooId,
      contentId,
      progress,
    ],
  );

  const hoverHandlers =
    trigger === "hover"
      ? makeHoverHandlers(rootHover, openHover, scheduleClose)
      : {};

  return (
    <PopoverContext.Provider value={ctx}>
      <div
        ref={rootRef}
        className={cn("relative inline-flex isolate", className)}
        {...hoverHandlers}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object")
        (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export interface PopoverTriggerProps {
  /** A single focusable element (e.g. a Button) that opens the popover. */
  children: ReactElement;
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
  const ctx = usePopoverContext("PopoverTrigger");
  // What the last gesture on the trigger was, and whether the panel was
  // already open when it started. A click reports neither.
  const tap = useTapGesture<boolean>();

  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  const childRef = (childProps as { ref?: Ref<HTMLElement> }).ref;

  const compose =
    <E extends { defaultPrevented?: boolean }>(
      name: string,
      handler: (event: E) => void,
    ) =>
    (event: E) => {
      (childProps[name] as ((e: unknown) => void) | undefined)?.(event);
      if (!event.defaultPrevented) handler(event);
    };

  // Observation, not action. `compose` steps aside for a child that handled
  // the event itself, which is right for anything that *does* something — but
  // a child preventing the pointerdown default (to hold focus, say) has not
  // said the gesture didn't happen. Skipping the record there left the panel
  // reading whatever the gesture before it had put in.
  const observe =
    <E,>(name: string, handler: (event: E) => void) =>
    (event: E) => {
      (childProps[name] as ((e: unknown) => void) | undefined)?.(event);
      handler(event);
    };

  // The hover trigger keeps its hover path and *adds* a tap one, rather than
  // swapping mode on a device that reports a touchscreen: a touchscreen laptop
  // has both inputs and the mouse must keep working. A hovering pointer has
  // already opened the panel on its way in, and a keyboard press arrives with
  // no pointerdown behind it, so only a tap toggles here. Which panel state
  // the tap acts on is read from the gesture's start, because a browser that
  // focuses the trigger on contact would otherwise open it mid-gesture and let
  // the click close it again.
  const handlers: Record<string, unknown> =
    ctx.triggerMode === "hover"
      ? {
          onFocus: compose("onFocus", ctx.openHover),
          onBlur: compose("onBlur", ctx.scheduleClose),
          onPointerDown: observe<React.PointerEvent>(
            "onPointerDown",
            (event) => tap.start(event, ctx.open),
          ),
          onPointerCancel: observe("onPointerCancel", tap.drop),
          onKeyDown: observe("onKeyDown", tap.drop),
          onClick: compose("onClick", () => {
            const gesture = tap.take();
            if (!gesture || gesture.pointerType === "mouse") return;
            ctx.setOpen(!gesture.state);
          }),
        }
      : { onClick: compose("onClick", ctx.toggle) };

  return cloneElement(child, {
    ...handlers,
    ref: mergeRefs(childRef, (node: HTMLElement | null) => {
      ctx.triggerRef.current = node;
    }),
    // Above the goo layer (z-[-1]) so the neck reads behind it.
    className: cn("relative z-0", childProps.className as string | undefined),
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.open,
    "aria-controls": ctx.open ? ctx.contentId : undefined,
    "data-state": ctx.open ? "open" : "closed",
  });
}

const ALIGN_ORIGIN: Record<Align, string> = {
  start: "left",
  center: "center",
  end: "right",
};

export interface PopoverContentProps {
  children: ReactNode;
  className?: string;
}

export function PopoverContent({ children, className }: PopoverContentProps) {
  const ctx = usePopoverContext("PopoverContent");
  const [portalReady, setPortalReady] = useState(false);
  const {
    side,
    align,
    gap,
    panelRadius,
    gooStrength,
    reduce,
    gooId,
    contentId,
    progress,
    triggerRef,
    contentRef,
    open,
    triggerMode,
    openHover,
    scheduleClose,
  } = ctx;

  const measureRef = contentRef;
  const panelHover = useHoverGesture();
  const blobRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo | null>(null);
  const supportsShapeRef = useRef(false);
  const layout = usePopoverPortalPosition(
    triggerRef,
    measureRef,
    portalReady,
  );

  useEffect(() => setPortalReady(true), []);

  const geo = useMemo(
    () =>
      buildGeo(
        layout?.trigger.width ?? 0,
        layout?.trigger.height ?? 0,
        layout?.content.width ?? 0,
        layout?.content.height ?? 0,
        side,
        align,
        gap,
        panelRadius,
      ),
    [layout, side, align, gap, panelRadius],
  );

  // Morph the same clip on the goo body and the content, so the whole popover
  // oozes as one and the text reveals with it.
  const render = useCallback((g: Geo | null, p: number) => {
    if (!g || g.layerW === 0) return;
    const clip = clipForProgress(g, p, supportsShapeRef.current);
    if (blobRef.current) blobRef.current.style.clipPath = clip;
    if (clipRef.current) clipRef.current.style.clipPath = clip;
  }, []);

  useLayoutEffect(() => {
    supportsShapeRef.current =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports(
        "clip-path",
        "shape(from 0px 0px, line to 1px 1px, close)",
      );
    geoRef.current = geo;
    render(geo, progress.get());
  }, [geo, progress, render]);

  useMotionValueEvent(progress, "change", (p) => render(geoRef.current, p));

  const hoverHandlers =
    triggerMode === "hover"
      ? makeHoverHandlers(panelHover, openHover, scheduleClose)
      : {};

  // Match the server and first client render, then attach the portal after
  // hydration. This preserves SSR without regenerating the page on the client.
  if (!portalReady) return null;

  return createPortal(
    <div
      data-popover-portal=""
      className="pointer-events-none fixed left-0 top-0 z-[9999] isolate size-0"
      style={{
        visibility: layout ? "visible" : "hidden",
        transform: `translate3d(${layout?.trigger.left ?? 0}px, ${layout?.trigger.top ?? 0}px, 0)`,
      }}
    >
      {/* Goo filter: blur, sharpen the alpha back into solid shapes, then lay
          the crisp original on top so blobs merge with liquid edges. */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <title>Popover visual effects</title>
        <defs>
          <filter id={gooId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={gooStrength}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Goo body: static trigger pill + morphing blob. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[-1]"
        style={{
          left: geo.left,
          top: geo.top,
          width: geo.layerW,
          height: geo.layerH,
          filter: reduce ? undefined : `url(#${gooId})`,
          clipPath: triggerCutout(geo),
        }}
      >
        <div
          className="absolute bg-popover"
          style={{
            left: geo.trigger.x,
            top: geo.trigger.y,
            width: geo.trigger.w,
            height: geo.trigger.h,
            borderRadius: geo.trigger.r,
          }}
        />
        <div
          ref={blobRef}
          className="absolute inset-0 bg-popover"
          style={{
            clipPath: clipForProgress(geo, progress.get(), false),
          }}
        />
      </div>

      {/* Content is clipped by the same morph. The portal wrapper stays
          pointer-transparent; only the fully open panel accepts interaction. */}
      <div
        className="pointer-events-none absolute z-10"
        style={{
          left: geo.left,
          top: geo.top,
          width: geo.layerW,
          height: geo.layerH,
        }}
      >
        <div
          ref={clipRef}
          inert={!open}
          className="absolute inset-0"
          style={{
            clipPath: clipForProgress(geo, progress.get(), false),
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div
            ref={measureRef}
            id={contentId}
            role="dialog"
            {...hoverHandlers}
            style={{
              position: "absolute",
              left: geo.panel.x,
              top: geo.panel.y,
              transformOrigin: `${ALIGN_ORIGIN[align]} ${side === "bottom" ? "top" : "bottom"}`,
            }}
            className={cn(
              "w-max max-w-[min(92vw,20rem)] p-4 text-popover-foreground outline-none",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
