"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

type IslandContextValue = {
  view: string | null;
};

const IslandContext = createContext<IslandContextValue | null>(null);

// Apple-style bounce on the shell morph — slightly underdamped on purpose so
// the island lands with a hint of overshoot.
const ISLAND_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.7,
} as const;

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
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.1 } }
          : {
              opacity: 0,
              scale: 0.9,
              filter: "blur(6px)",
              transition: { duration: 0.18, ease: EASE_OUT },
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

  return (
    <IslandContext.Provider value={{ view }}>
      <motion.div
        layout={!reduce}
        role="status"
        aria-live="polite"
        transition={ISLAND_SPRING}
        style={{ borderRadius: expanded ? 28 : 999 }}
        className={cn(
          "relative inline-flex min-h-9 items-center justify-center overflow-hidden",
          "bg-foreground text-background shadow-2xl will-change-transform",
          expanded ? "px-5 py-3" : "px-4 py-1.5",
          className,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!expanded && compact ? (
            <Slot keyId="compact" className="gap-2 text-xs font-medium">
              {compact}
            </Slot>
          ) : null}
        </AnimatePresence>
        {children}
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
        <Slot keyId={id} className={className}>
          {children}
        </Slot>
      ) : null}
    </AnimatePresence>
  );
}
