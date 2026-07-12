"use client";

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
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
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";
type TriggerMode = "click" | "hover";

const GOO_SPRING = {
  type: "spring",
  visualDuration: 0.32,
  bounce: 0.28,
} as const;
const HOVER_CLOSE_DELAY = 120;

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

function insetFor(rect: Rect, layerW: number, layerH: number): string {
  const top = rect.y;
  const right = layerW - (rect.x + rect.w);
  const bottom = layerH - (rect.y + rect.h);
  const left = rect.x;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${rect.r}px)`;
}

function insetForProgress(geo: Geo, p: number): string {
  const t = geo.trigger;
  const pn = geo.panel;
  const rect: Rect = {
    x: lerp(t.x, pn.x, p),
    y: lerp(t.y, pn.y, p),
    w: lerp(t.w, pn.w, p),
    h: lerp(t.h, pn.h, p),
    r: lerp(t.r, pn.r, p),
  };
  return insetFor(rect, geo.layerW, geo.layerH);
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      reduce ? { duration: 0 } : GOO_SPRING,
    );
    return () => animation.stop();
  }, [open, progress, reduce]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Trigger and panel share rootRef, so moving between them isn't "outside".
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (trigger === "click") window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setOpen, trigger]);

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
      ? { onMouseEnter: openHover, onMouseLeave: scheduleClose }
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

  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  const childRef = (childProps as { ref?: Ref<HTMLElement> }).ref;

  const compose =
    (name: string, handler: () => void) =>
    (event: { defaultPrevented?: boolean }) => {
      (childProps[name] as ((e: unknown) => void) | undefined)?.(event);
      if (!event.defaultPrevented) handler();
    };

  const handlers: Record<string, unknown> =
    ctx.triggerMode === "hover"
      ? {
          onFocus: compose("onFocus", ctx.openHover),
          onBlur: compose("onBlur", ctx.scheduleClose),
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
    open,
    triggerMode,
    openHover,
    scheduleClose,
  } = ctx;

  const measureRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo | null>(null);

  const [sizes, setSizes] = useState({ tW: 0, tH: 0, cW: 0, cH: 0 });

  useLayoutEffect(() => {
    const triggerNode = triggerRef.current;
    const contentNode = measureRef.current;
    if (!contentNode) return;

    const measure = () => {
      const tW = triggerNode?.offsetWidth ?? 0;
      const tH = triggerNode?.offsetHeight ?? 0;
      const cW = contentNode.offsetWidth;
      const cH = contentNode.offsetHeight;
      setSizes((prev) =>
        prev.tW === tW && prev.tH === tH && prev.cW === cW && prev.cH === cH
          ? prev
          : { tW, tH, cW, cH },
      );
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(contentNode);
    if (triggerNode) observer.observe(triggerNode);
    return () => observer.disconnect();
  }, [triggerRef]);

  const geo = useMemo(
    () =>
      buildGeo(
        sizes.tW,
        sizes.tH,
        sizes.cW,
        sizes.cH,
        side,
        align,
        gap,
        panelRadius,
      ),
    [sizes, side, align, gap, panelRadius],
  );

  // Morph the same clip on the goo body and the content, so the whole popover
  // oozes as one and the text reveals with it.
  const render = useCallback((g: Geo | null, p: number) => {
    if (!g || g.layerW === 0) return;
    const clip = insetForProgress(g, p);
    if (blobRef.current) blobRef.current.style.clipPath = clip;
    if (clipRef.current) clipRef.current.style.clipPath = clip;
  }, []);

  useLayoutEffect(() => {
    geoRef.current = geo;
    render(geo, progress.get());
  }, [geo, progress, render]);

  useMotionValueEvent(progress, "change", (p) => render(geoRef.current, p));

  const hoverHandlers =
    triggerMode === "hover"
      ? { onMouseEnter: openHover, onMouseLeave: scheduleClose }
      : {};

  return (
    <>
      {/* Goo filter: blur, sharpen the alpha back into solid shapes, then lay
          the crisp original on top so blobs merge with liquid edges. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        className="pointer-events-none absolute"
      >
        <title>Popover goo filter</title>
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

      {/* Goo body: static trigger pill + morphing blob, behind the trigger. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[-1]"
        style={{
          left: geo.left,
          top: geo.top,
          width: geo.layerW,
          height: geo.layerH,
          filter: reduce ? undefined : `url(#${gooId})`,
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
          style={{ clipPath: insetForProgress(geo, progress.get()) }}
        />
      </div>

      {/* Content, clipped by the same morph. pointer-events-none so it never
          shadows the trigger; the open panel re-enables its own. */}
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
            clipPath: insetForProgress(geo, progress.get()),
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
    </>
  );
}
