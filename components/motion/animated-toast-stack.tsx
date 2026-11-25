"use client";

import { AnimatePresence, motion, type PanInfo, useReducedMotion } from "motion/react";
import { type ReactNode, type Ref, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { notifySound } from "@/lib/sounds/notify";
import { cn } from "@/lib/utils";
import { ToastBody } from "./animated-toast-stack/toast-body";
import type {
  AnimatedToast,
  ToastClassNames,
  ToastPosition,
  ToastStatus,
} from "./animated-toast-stack/types";
import { useContentSize } from "./animated-toast-stack/use-content-size";

export type {
  AnimatedToast,
  AnimatedToastAction,
  ToastClassNames,
  ToastInput,
  ToastPosition,
  ToastStatus,
  UseAnimatedToastStackOptions,
} from "./animated-toast-stack/types";
export { useAnimatedToastStack } from "./animated-toast-stack/use-animated-toast-stack";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const animatedToastStackMessages = {
  dismiss: "Dismiss toast",
  region: "Notifications",
  more: "{count} more",
};

export type AnimatedToastStackMessages = typeof animatedToastStackMessages;

export interface AnimatedToastStackProps {
  toasts: AnimatedToast[];
  onDismiss?: (id: string) => void;
  position?: ToastPosition;
  placement?: "static" | "fixed" | "absolute";
  fixed?: boolean;
  portal?: boolean;
  portalRoot?: Element | null;
  /** How many toasts the open island lists. Default 4. */
  maxVisible?: number;
  className?: string;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  /** Override any built-in string. */
  labels?: Partial<AnimatedToastStackMessages>;
  /**
   * Play a two-note chime when a new toast arrives. Off by default; a
   * `SoundProvider` can mute it app-wide.
   */
  sound?: boolean;
  /**
   * Called when the island opens (hover, focus or a tap). Pass the hook's
   * `pause` so toasts don't run out while someone is reading them.
   */
  onPause?: () => void;
  /** Called when it closes again. Pass the hook's `resume`. */
  onResume?: () => void;
}

// The island blooms out of a dot this size and folds back into one.
const DOT = 40;
// One radius, never animated: the browser clamps it to half the height, so
// the dot, the pill and the card all fall out of the size spring.
const RADIUS = 20;
// The card and the open list share one width, so swapping between them only
// moves the height.
const CARD = "w-[22rem] max-w-[calc(100vw-2rem)]";
// Closing waits a beat, so a shell resizing under the pointer never flaps.
const COLLAPSE_DELAY = 120;
// The island's size spring. Less bounce than SPRING_MORPH: a toast resizes
// often, and an overshooting height reads as a wobble. Local because only this
// shell morphs between so many sizes.
const ISLAND_SPRING = { type: "spring", duration: 0.45, bounce: 0.08 } as const;
const FOLD = { duration: 0.25, ease: EASE_OUT } as const;
const FADE = { duration: 0.12, ease: EASE_OUT } as const;
// New content blooms in once the shell is most of the way open, instead of
// riding the whole spring, so it is never seen half clipped.
const CONTENT_IN = {
  default: ISLAND_SPRING,
  opacity: { duration: 0.18, delay: 0.05, ease: EASE_OUT },
  filter: { duration: 0.22, delay: 0.05, ease: EASE_OUT },
} as const;
// Overlaps the incoming fade, so a swap is a crossfade and never a blank blink.
const CONTENT_OUT = { duration: 0.1, ease: EASE_OUT } as const;
// A swipe this far (px) or this fast (px/s) dismisses.
const SWIPE_DISTANCE = 72;
const SWIPE_SPEED = 520;

const POSITION_CLASS: Record<ToastPosition, string> = {
  "top-left": "left-4 top-4 justify-start",
  "top-center": "left-1/2 top-4 -translate-x-1/2 justify-center",
  "top-right": "right-4 top-4 justify-end",
  "bottom-left": "bottom-6 left-4 justify-start",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 justify-center",
  "bottom-right": "bottom-6 right-4 justify-end",
};

// Content pins to the corner the island grows from: it holds still while the
// shell opens around it, and the outgoing and incoming content share that
// corner, so neither jumps when the other changes the size.
const PIN_CLASS: Record<ToastPosition, string> = {
  "top-left": "items-start justify-start",
  "top-center": "items-start justify-center",
  "top-right": "items-start justify-end",
  "bottom-left": "items-end justify-start",
  "bottom-center": "items-end justify-center",
  "bottom-right": "items-end justify-end",
};

const swiped = (info: PanInfo) =>
  Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_SPEED;

export function AnimatedToastStack({
  toasts,
  onDismiss,
  position = "bottom-right",
  placement,
  fixed = false,
  portal,
  portalRoot,
  maxVisible = 4,
  className,
  classNames,
  icons,
  renderToast,
  labels,
  sound = false,
  onPause,
  onResume,
}: AnimatedToastStackProps) {
  const t = useMessages("animatedToastStack", animatedToastStackMessages, labels);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const play = useSound(notifySound, { enabled: sound });
  // Toasts present on the first render are already on screen, so only ids
  // that arrive later chime, once per batch.
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = toasts.map((toast) => toast.id);
    if (seen.current && ids.some((id) => !seen.current?.has(id))) play();
    seen.current = new Set(ids);
  }, [toasts, play]);
  const visible = toasts.slice(-maxVisible);
  const resolvedPlacement = placement ?? (fixed ? "fixed" : "static");
  const shouldPortal = portal ?? resolvedPlacement === "fixed";

  useEffect(() => {
    setPortalTarget(shouldPortal ? (portalRoot ?? document.body) : null);
  }, [portalRoot, shouldPortal]);

  const layer = (
    <div
      className={cn(
        "pointer-events-none flex",
        resolvedPlacement === "fixed" && "fixed z-[90]",
        resolvedPlacement === "absolute" && "absolute z-20",
        resolvedPlacement !== "static" && cn(CARD, POSITION_CLASS[position]),
        classNames?.root,
        className,
      )}
    >
      {/* One island cannot announce each toast, so a hidden live region does:
          every new toast, and every change to one, is read out politely. */}
      <div className="sr-only" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <p key={toast.id}>
            {toast.title}
            {toast.description ? ". " : null}
            {toast.description}
          </p>
        ))}
      </div>
      <AnimatePresence>
        {visible.length > 0 ? (
          <Island
            key="island"
            toasts={visible}
            position={position}
            onDismiss={onDismiss}
            classNames={classNames}
            icons={icons}
            renderToast={renderToast}
            labels={{ dismiss: t("dismiss"), region: t("region"), more: (count) => t("more", { count }) }}
            onPause={onPause}
            onResume={onResume}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (shouldPortal && !portalTarget) return null;
  if (shouldPortal && portalTarget) return createPortal(layer, portalTarget);
  return layer;
}

function Island({
  toasts,
  position,
  onDismiss,
  classNames,
  icons,
  renderToast,
  labels,
  onPause,
  onResume,
}: {
  toasts: AnimatedToast[];
  position: ToastPosition;
  onDismiss?: (id: string) => void;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  labels: { dismiss: string; region: string; more: (count: number) => string };
  onPause?: () => void;
  onResume?: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [sizer, size] = useContentSize<HTMLDivElement>();
  const shellRef = useRef<HTMLElement>(null);
  const newest = toasts[toasts.length - 1];
  const others = toasts.length - 1;
  const fromBottom = position.startsWith("bottom");
  const edge = fromBottom ? 1 : -1;
  const compact = !newest.description && !newest.action && !renderToast;
  const canSwipe = newest.dismissible !== false && Boolean(onDismiss);

  // The island opens into the full list while it is hovered or focused, or
  // after a tap on a touch screen, and holds every countdown while open.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  const open = hovered || focused || tapped;
  const collapseTimer = useRef<number | null>(null);
  // Set when a swipe throws away the last toast: the island leaves that way.
  const [flung, setFlung] = useState<-1 | 0 | 1>(0);

  const latest = useRef({ onPause, onResume });
  useLayoutEffect(() => {
    latest.current = { onPause, onResume };
  });
  useEffect(() => {
    if (open) latest.current.onPause?.();
    else latest.current.onResume?.();
  }, [open]);
  useEffect(
    () => () => {
      if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
      latest.current.onResume?.();
    },
    [],
  );

  // A tap anywhere else closes what a tap opened.
  useEffect(() => {
    if (!tapped) return;
    const onDown = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) setTapped(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [tapped]);

  const ordered = fromBottom ? toasts : [...toasts].reverse();
  const rowTransition = reduce ? FADE : CONTENT_IN;
  const shellTransition = reduce
    ? { width: { duration: 0 }, height: { duration: 0 }, default: { duration: 0.15, ease: EASE_OUT } }
    : {
        default: ISLAND_SPRING,
        opacity: { duration: 0.18, ease: EASE_OUT },
        filter: { duration: 0.24, ease: EASE_OUT },
      };
  // Outgoing content holds the corner it was pinned to while it fades.
  const anchorX = position.endsWith("right") ? "right" : "left";
  const anchorY = fromBottom ? "bottom" : "top";
  const origin = `${anchorY} ${position.endsWith("center") ? "center" : anchorX}`;

  return (
    <motion.section
      ref={shellRef}
      aria-label={labels.region}
      // Reachable from the keyboard even as a pill with nothing to press.
      tabIndex={0}
      initial={reduce ? { opacity: 0 } : { opacity: 0, width: DOT, height: DOT, y: 16 * edge, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        ...(size ? { width: size.width, height: size.height } : {}),
      }}
      // Folds back into the dot, or flies off the way it was swiped.
      exit={
        reduce
          ? { opacity: 0, transition: FADE }
          : flung
            ? { opacity: 0, x: flung * 160, filter: "blur(4px)", transition: FOLD }
            : { opacity: 0, width: DOT, height: DOT, y: 10 * edge, filter: "blur(6px)", transition: FOLD }
      }
      transition={shellTransition}
      drag={!open && canSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (!canSwipe || !swiped(info)) return;
        if (toasts.length === 1) setFlung(info.offset.x < 0 ? -1 : 1);
        onDismiss?.(newest.id);
      }}
      onTap={(event) => {
        const pointer = (event as PointerEvent).pointerType;
        if (pointer !== "touch" && pointer !== "pen") return;
        // A tap on a toast's own button (close, action) is that button's.
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("button")) return;
        setTapped((current) => !current);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
        setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
        collapseTimer.current = window.setTimeout(() => setHovered(false), COLLAPSE_DELAY);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        setHovered(false);
        setTapped(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }}
      style={{ borderRadius: RADIUS }}
      className={cn(
        // A ring, not a border: the shell's box stays exactly the content's
        // size, so leaving content is pinned where it was drawn.
        "pointer-events-auto relative flex touch-pan-y overflow-hidden bg-card text-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)] ring-1 ring-border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        PIN_CLASS[position],
        classNames?.surface,
      )}
    >
      {/* w-max keeps this at the natural size of what is shown; the shell
          springs its real width and height toward it. */}
      <div ref={sizer} className="w-max shrink-0">
        <AnimatePresence mode="popLayout" initial={false} anchorX={anchorX} anchorY={anchorY}>
          {open || !compact ? (
            // The card and the open list are one stack: the newest toast's row
            // stays mounted while the others fade in around it, so opening
            // never redraws the text that is already on screen.
            <Slot key="stack" fromBottom={fromBottom} origin={origin} reduce={reduce} className={CARD}>
              <ol className="relative divide-y divide-border">
                <AnimatePresence initial={false} mode="popLayout" anchorY={anchorY}>
                  {(open ? ordered : [newest]).map((toast) => (
                    <Row
                      key={toast.id}
                      toast={toast}
                      others={open ? 0 : others}
                      swipe={open}
                      onDismiss={onDismiss}
                      classNames={classNames}
                      icons={icons}
                      renderToast={renderToast}
                      labels={labels}
                      reduce={reduce}
                      transition={rowTransition}
                    />
                  ))}
                </AnimatePresence>
              </ol>
            </Slot>
          ) : (
            <Slot key={`${newest.id}-pill`} fromBottom={fromBottom} origin={origin} reduce={reduce}>
              <ToastBody
                toast={newest}
                compact
                others={others}
                onDismiss={onDismiss}
                dismissLabel={labels.dismiss}
                moreLabel={labels.more(others)}
                classNames={classNames}
                icons={icons}
                renderToast={renderToast}
                reduce={reduce}
              />
            </Slot>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/** What the island shows: it unfurls out of the edge and is sucked back into it. */
function Slot({
  ref,
  fromBottom,
  origin,
  reduce,
  className,
  children,
}: {
  // popLayout measures and pins the outgoing slot through this ref.
  ref?: Ref<HTMLDivElement>;
  fromBottom: boolean;
  origin: string;
  reduce: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: fromBottom ? 4 : -4, filter: "blur(4px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      // Out fast and blur-free, before the resizing shell can clip it.
      exit={reduce ? { opacity: 0, transition: FADE } : { opacity: 0, scale: 0.97, transition: CONTENT_OUT }}
      transition={reduce ? FADE : CONTENT_IN}
      style={{ transformOrigin: origin }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** One toast in the open island: its own close, and a swipe of its own. */
function Row({
  ref,
  toast,
  others,
  swipe,
  onDismiss,
  classNames,
  icons,
  renderToast,
  labels,
  reduce,
  transition,
}: {
  // popLayout pins a leaving row through this ref while the others close up.
  ref?: Ref<HTMLLIElement>;
  toast: AnimatedToast;
  // The collapsed card counts the toasts waiting behind it.
  others: number;
  // Rows swipe on their own only in the open list; the collapsed island swipes whole.
  swipe: boolean;
  onDismiss?: (id: string) => void;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  labels: { dismiss: string; more: (count: number) => string };
  reduce: boolean;
  transition: object;
}) {
  const [flung, setFlung] = useState<-1 | 0 | 1>(0);
  const canSwipe = swipe && toast.dismissible !== false && Boolean(onDismiss);
  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={
        reduce || !flung
          ? { opacity: 0, transition: FADE }
          : { opacity: 0, x: flung * 160, transition: FOLD }
      }
      transition={transition}
      drag={canSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (!canSwipe || !swiped(info)) return;
        setFlung(info.offset.x < 0 ? -1 : 1);
        onDismiss?.(toast.id);
      }}
      className={cn("relative bg-card", classNames?.item)}
    >
      <ToastBody
        toast={toast}
        others={others}
        onDismiss={onDismiss}
        dismissLabel={labels.dismiss}
        moreLabel={labels.more(others)}
        classNames={classNames}
        icons={icons}
        renderToast={renderToast}
        reduce={reduce}
      />
    </motion.li>
  );
}
