"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type IslandContextValue = {
  view: string | null;
};

const IslandContext = createContext<IslandContextValue | null>(null);

// Shell physics, Apple style: expansion blooms out of the pill with a visible
// overshoot, and collapse returns with the same life — the pill squeezes a
// touch past its size and springs back. The shell animates real width/height
// (not transforms), so slots are never scale-distorted.
const EXPAND_SPRING = {
  type: "spring",
  stiffness: 550,
  damping: 25,
  mass: 0.5,
} as const;

const COLLAPSE_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 24,
  mass: 0.45,
} as const;

// Content pops from the pill core just after the shell starts moving.
const CONTENT_SPRING = {
  type: "spring",
  stiffness: 560,
  damping: 28,
  mass: 0.5,
} as const;

// Real radii, tweened separately from the size spring. Springing between a
// fake huge radius and a small one makes corners glitch mid-resize; these two
// values are close (18.5 is exactly half the 37px pill) so the corner shape
// stays stable throughout.
const RADIUS_COMPACT = 18.5;
const RADIUS_EXPANDED = 24;

/** Tracks the natural size of the content so the shell can spring to it. */
function useContentSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

function Slot({
  keyId,
  children,
  className,
  scaleFrom = 0.8,
  delay = 0.04,
}: {
  keyId: string;
  children: ReactNode;
  className?: string;
  /** Scale the content emerges from — everything originates at the pill. */
  scaleFrom?: number;
  /** Lets the shell lead the bloom before content appears. */
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={keyId}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: scaleFrom, y: -8, filter: "blur(8px)" }
      }
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
      }
      // Exit gets sucked up into the pill — fast, blur-free, before the
      // shrinking shell can clip it.
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.1 } }
          : {
              opacity: 0,
              scale: 0.85,
              y: -6,
              transition: { duration: 0.08, ease: EASE_OUT },
            }
      }
      transition={
        reduce
          ? { duration: 0.15 }
          : {
              ...CONTENT_SPRING,
              delay,
              opacity: { duration: 0.18, ease: EASE_OUT, delay },
              filter: { duration: 0.22, ease: EASE_OUT, delay },
            }
      }
      // Anchored to the pill line: content unfurls downward out of it and is
      // sucked back up into it.
      style={{ transformOrigin: "top center" }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.div>
  );
}

export interface DynamicIslandProps {
  /** Active view id. `null` shows the compact pill. */
  view: string | null;
  /** Compact pill content, shown when no view is active. */
  compact?: ReactNode;
  /** DynamicIslandView elements. */
  children?: ReactNode;
  className?: string;
}

export function DynamicIsland({
  view,
  compact,
  children,
  className,
}: DynamicIslandProps) {
  const reduce = useReducedMotion();
  const expanded = view !== null;
  const [sizerRef, size] = useContentSize();

  return (
    <IslandContext.Provider value={{ view }}>
      <motion.div
        role="status"
        aria-live="polite"
        initial={false}
        animate={
          size
            ? {
                width: size.width,
                height: size.height,
                borderRadius: expanded ? RADIUS_EXPANDED : RADIUS_COMPACT,
              }
            : { borderRadius: expanded ? RADIUS_EXPANDED : RADIUS_COMPACT }
        }
        transition={
          reduce
            ? { duration: 0 }
            : {
                ...(expanded ? EXPAND_SPRING : COLLAPSE_SPRING),
                borderRadius: { duration: 0.2, ease: EASE_OUT },
              }
        }
        // items-start pins content to the top edge while the shell springs, so
        // expansion reads as unfurling downward out of the pill. Top-align the
        // island in its parent (like under a notch) to complete the effect.
        className={cn(
          "relative inline-flex items-start justify-center overflow-hidden",
          "bg-foreground text-background shadow-2xl",
          className,
        )}
      >
        {/* w-max keeps this at the natural size of the active content; the
            shell springs toward it. */}
        <div ref={sizerRef} className="w-max">
          <AnimatePresence mode="popLayout" initial={false}>
            {!expanded && compact ? (
              <Slot
                keyId="compact"
                scaleFrom={0.85}
                delay={0.06}
                // iPhone pill proportions: ~126 x 37.
                className="min-h-[37px] min-w-[126px] gap-2 px-4 py-1.5 text-xs font-medium"
              >
                {compact}
              </Slot>
            ) : null}
          </AnimatePresence>
          {children}
        </div>
      </motion.div>
    </IslandContext.Provider>
  );
}

export interface DynamicIslandViewProps {
  /** Matches the parent `view` prop when active. */
  id: string;
  children: ReactNode;
  className?: string;
}

export function DynamicIslandView({ id, children, className }: DynamicIslandViewProps) {
  const ctx = useContext(IslandContext);
  if (!ctx) throw new Error("DynamicIslandView must be used inside <DynamicIsland>");
  const active = ctx.view === id;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {active ? (
        <Slot keyId={id} className={cn("px-6 py-4", className)}>
          {children}
        </Slot>
      ) : null}
    </AnimatePresence>
  );
}
