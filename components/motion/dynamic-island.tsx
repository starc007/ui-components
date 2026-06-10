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
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

type IslandContextValue = {
  view: string | null;
};

const IslandContext = createContext<IslandContextValue | null>(null);

// Shell resize physics — a hint of overshoot without wobbling the clip.
// The shell animates real width/height (not transforms), so slots are never
// scale-distorted while it resizes. Classic measured-container pattern.
const ISLAND_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.65,
} as const;

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
}: {
  keyId: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={keyId}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      // Exit fast and blur-free: the leaving slot is popped out of layout at
      // its old size while the shell shrinks over it.
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.1 } }
          : {
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.12, ease: EASE_OUT },
            }
      }
      transition={reduce ? { duration: 0.15 } : SPRING_SWAP}
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
                borderRadius: expanded ? 28 : 999,
              }
            : { borderRadius: expanded ? 28 : 999 }
        }
        transition={reduce ? { duration: 0 } : ISLAND_SPRING}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          "bg-foreground text-background shadow-2xl",
          className,
        )}
      >
        {/* w-max keeps this at the natural size of the active content; the
            shell springs toward it. */}
        <div ref={sizerRef} className="w-max">
          <AnimatePresence mode="popLayout" initial={false}>
            {!expanded && compact ? (
              <Slot keyId="compact" className="min-h-9 gap-2 px-4 py-1.5 text-xs font-medium">
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
        <Slot keyId={id} className={cn("px-5 py-3", className)}>
          {children}
        </Slot>
      ) : null}
    </AnimatePresence>
  );
}
