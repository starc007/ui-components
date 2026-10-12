"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
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
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { useMorphSurface } from "@/lib/hooks/use-morph-surface";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";
type Align = "start" | "end";

type MorphContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  triggerId: string;
  contentId: string;
  /** The element the panel measures against — see `registerTrigger`. */
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  registerTrigger: (node: HTMLElement | null) => void;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphPopover>`);
  return ctx;
}

export interface MorphPopoverProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * A popover whose panel grows out of the trigger: the surface starts as the
 * trigger's box and springs to the panel's, trimming the content inside as it
 * goes, then retraces the path on close. Closes on outside pointer / Escape.
 * Controlled or uncontrolled.
 */
export function MorphPopover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: MorphPopoverProps) {
  const baseId = useId();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
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
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  // A trigger normally registers itself through MorphPopoverTrigger. It can't
  // when something else already clones the element — a Tooltip wrapping the
  // button, say — and an unregistered trigger leaves the panel with nothing to
  // measure against, so it renders permanently invisible. The root boxes the
  // trigger exactly (the content portals out of it), so it stands in until a
  // real trigger registers, and stands in again if that one unmounts. Both are
  // state, so a trigger arriving while the panel is open re-anchors it.
  const anchorRef = useMemo<React.MutableRefObject<HTMLElement | null>>(
    () => ({ current: trigger ?? root }),
    [root, trigger],
  );

  // The panel is a `role="dialog"` and goes inert the moment it closes, so
  // focus cannot be left sitting inside it: a dismissal hands it back to the
  // trigger, the way the ARIA dialog pattern asks. A pointer dismissal takes
  // the focus onward itself when it lands on something focusable — this only
  // catches the case where it would otherwise be stranded. When no trigger has
  // registered, the root anchor stands in only if it can actually hold focus;
  // there is nowhere better than where the keyboard already is, so leave it.
  const close = useCallback(() => {
    setOpen(false);
    const focused = document.activeElement;
    const inPanel =
      focused instanceof HTMLElement && contentRef.current?.contains(focused);
    if (!inPanel) return;
    const restore = trigger ?? (root && root.tabIndex >= 0 ? root : null);
    restore?.focus();
  }, [root, setOpen, trigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        root &&
        !root.contains(target) &&
        !contentRef.current?.contains(target)
      )
        close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, root, close]);

  const ctx = useMemo<MorphContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-content`,
      triggerRef: anchorRef,
      registerTrigger: setTrigger,
      contentRef,
    }),
    [open, setOpen, toggle, baseId, anchorRef],
  );

  return (
    <MorphContext.Provider value={ctx}>
      <div ref={setRoot} className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </MorphContext.Provider>
  );
}

export interface MorphPopoverTriggerProps {
  children: ReactElement;
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

/** Wraps a single element, toggling the popover on click. */
export function MorphPopoverTrigger({ children }: MorphPopoverTriggerProps) {
  const ctx = useMorphContext("MorphPopoverTrigger");
  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child?.props?.onClick as
    | ((e: unknown) => void)
    | undefined;
  const childRef = (child?.props as { ref?: Ref<HTMLElement> } | undefined)
    ?.ref;
  // Register once per actual ref change, not once per open-state render.
  const mergedRef = useMemo(
    () => mergeRefs(childRef, ctx.registerTrigger),
    [childRef, ctx.registerTrigger],
  );
  if (!isValidElement(children)) return children;

  return cloneElement(child, {
    id: ctx.triggerId,
    ref: mergedRef,
    onClick: (e: unknown) => {
      childOnClick?.(e);
      ctx.toggle();
    },
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.open,
    "aria-controls": ctx.open ? ctx.contentId : undefined,
  });
}

// Exits are faster than entrances: the surface retracts on a short ease rather
// than the spring that brought it out.
const MORPH_EXIT = { duration: 0.2, ease: EASE_OUT } as const;
// The surface emerges from a thin lip at the trigger's near edge, not from the
// trigger's whole box: the trigger stays visible, and the panel still reads as
// growing out of it.
const LIP = 8;

export interface MorphPopoverContentProps {
  children: ReactNode;
  side?: Side;
  align?: Align;
  /** Gap between trigger and panel, in px. Default 8. */
  sideOffset?: number;
  /** Panel corner radius, in px. Default 16. */
  radius?: number;
  /** Draw the surface shadow. Default true. */
  shadow?: boolean;
  /** Runs after the portalled surface is positioned and visible. */
  onOpenAutoFocus?: (content: HTMLDivElement) => void;
  className?: string;
}

export function MorphPopoverContent(props: MorphPopoverContentProps) {
  const ctx = useMorphContext("MorphPopoverContent");
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  if (!portalReady) return null;
  return createPortal(
    <AnimatePresence>
      {ctx.open && <MorphPopoverSurface {...props} />}
    </AnimatePresence>,
    document.body,
  );
}

// Measurement belongs to the mounted portal session: reopening must not start
// an entrance at the previous session's coordinates before measuring this one.
function MorphPopoverSurface({
  children,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  radius = 16,
  shadow = true,
  onOpenAutoFocus,
  className,
}: MorphPopoverContentProps) {
  const ctx = useMorphContext("MorphPopoverContent");
  const reduce = useReducedMotion() ?? false;
  const [isPresent, safeToRemove] = usePresence();
  const layout = usePopoverPortalPosition(
    ctx.triggerRef,
    ctx.contentRef,
    isPresent,
  );

  const preferredLeft = layout
    ? align === "end"
      ? layout.trigger.left + layout.trigger.width - layout.content.width
      : layout.trigger.left
    : 0;
  // Keep larger compositions, such as calendars, inside the viewport. Prefer
  // the requested side, then use the roomier side when it cannot fit there.
  const gutter = 12;
  const below = layout
    ? Math.max(
        0,
        window.innerHeight -
          layout.trigger.top -
          layout.trigger.height -
          sideOffset -
          gutter,
      )
    : 0;
  const above = layout
    ? Math.max(0, layout.trigger.top - sideOffset - gutter)
    : 0;
  const requestedSpace = side === "bottom" ? below : above;
  const otherSpace = side === "bottom" ? above : below;
  const resolvedSide =
    layout &&
    layout.content.height > requestedSpace &&
    otherSpace > requestedSpace
      ? side === "bottom"
        ? "top"
        : "bottom"
      : side;
  const availableHeight = resolvedSide === "bottom" ? below : above;
  const left = layout
    ? Math.max(
        gutter,
        Math.min(
          preferredLeft,
          window.innerWidth - layout.content.width - gutter,
        ),
      )
    : 0;
  const top = layout
    ? resolvedSide === "bottom"
      ? layout.trigger.top + layout.trigger.height + sideOffset
      : Math.max(
          gutter,
          layout.trigger.top - layout.content.height - sideOffset,
        )
    : 0;

  // One progress value drives the whole morph: the surface's transform, its
  // corner correction and both fades read from it, so nothing settles early.
  const progress = useMotionValue(0);
  const morph = useMorphSurface(
    progress,
    layout
      ? {
          left: layout.trigger.left,
          top:
            resolvedSide === "bottom"
              ? layout.trigger.top + layout.trigger.height
              : layout.trigger.top - LIP,
          width: layout.trigger.width,
          height: LIP,
        }
      : null,
    layout
      ? { left, top, width: layout.content.width, height: layout.content.height }
      : null,
    radius,
  );
  // The surface materialises over its first frames rather than popping in as
  // a sliver; the content follows from the point its counter-scale is exact
  // (the surface at a quarter of its box), so it never shows distorted and
  // the panel reads as a panel while it is still arriving.
  const surfaceOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const contentOpacity = useTransform(progress, [0.25, 0.6], [0, 1]);
  // Reduced motion has no travel, so a short fade carries the whole entrance
  // and exit on its own.
  const fade = useMotionValue(reduce ? 0 : 1);
  const ready = layout !== null;
  const focusedOnOpen = useRef(false);
  useEffect(() => {
    if (
      !ready ||
      !isPresent ||
      focusedOnOpen.current ||
      !ctx.contentRef.current
    )
      return;
    focusedOnOpen.current = true;
    onOpenAutoFocus?.(ctx.contentRef.current);
  }, [ready, isPresent, ctx.contentRef, onOpenAutoFocus]);
  // `safeToRemove` is a new function on every render: AnimatePresence
  // rebuilds its context each time its parent renders. Read it through a ref
  // so a render during the exit (a consumer's state change, a list streaming
  // in) does not restart the exit from where it got to — restarted every
  // render, it would close in ever smaller steps and never report completion,
  // leaving an inert, invisible panel mounted for good.
  const safeToRemoveRef = useRef(safeToRemove);
  useLayoutEffect(() => {
    safeToRemoveRef.current = safeToRemove;
  });
  useEffect(() => {
    if (!ready) {
      if (!isPresent) safeToRemoveRef.current?.();
      return;
    }
    const settle = () => {
      if (!isPresent) safeToRemoveRef.current?.();
    };
    if (reduce) {
      progress.jump(1);
      const animation = animate(fade, isPresent ? 1 : 0, {
        duration: 0.12,
        onComplete: settle,
      });
      return () => animation.stop();
    }
    const animation = animate(progress, isPresent ? 1 : 0, {
      ...(isPresent ? SPRING_PANEL : MORPH_EXIT),
      onComplete: settle,
    });
    return () => animation.stop();
  }, [fade, progress, ready, isPresent, reduce]);

  return (
    <motion.div
      data-morph-popover-portal=""
      inert={!isPresent}
      style={{
        left,
        top,
        opacity: fade,
        pointerEvents: isPresent ? "auto" : "none",
        visibility: layout ? "visible" : "hidden",
      }}
      className="fixed z-[9999]"
    >
      {/* The surface is laid out at its final box and transformed from the
          trigger's; its overflow clip trims the content, which takes the
          inverse scale so it keeps its size and travels with the surface. */}
      <motion.div
        ref={ctx.contentRef}
        id={ctx.contentId}
        role="dialog"
        aria-labelledby={ctx.triggerId}
        style={{
          x: morph.x,
          y: morph.y,
          scaleX: morph.scaleX,
          scaleY: morph.scaleY,
          borderRadius: morph.borderRadius,
          opacity: surfaceOpacity,
          transformOrigin: "0 0",
        }}
        className={cn(
          "overflow-hidden border border-border bg-background",
          shadow && "shadow-[0_10px_18px_rgba(0,0,0,0.14)]",
        )}
      >
        <motion.div
          style={{
            scaleX: morph.contentScaleX,
            scaleY: morph.contentScaleY,
            opacity: contentOpacity,
            transformOrigin: "0 0",
            maxHeight: layout ? availableHeight : undefined,
            overflowY: "auto",
          }}
          className={className}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
