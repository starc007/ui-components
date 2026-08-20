"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: ReactNode;
  /** Class for the panel surface. */
  className?: string;
  /** Class for the backdrop. */
  backdropClassName?: string;
  ariaLabel?: string;
  /** Close when the backdrop is clicked. Default true. */
  dismissable?: boolean;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  backdropClassName,
  ariaLabel,
  dismissable = true,
}: DrawerProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  const offscreen = side === "right" ? "100%" : "-100%";

  // Two fixed siblings, no wrapper. A transparent fixed element that spans the
  // viewport edges makes iOS 26 Safari sample the rendered page for its edge
  // colours on every committed frame, through a blocking call into the GPU
  // process. The backdrop still spans the edges but carries the scrim colour,
  // so WebKit reads that colour instead of the page; the panel is inset off
  // one side and paints its own surface. Neither is a bare transparent box.
  return (
    <AnimatePresence>
      {open ? (
        <motion.button
          key="backdrop"
          type="button"
          aria-label="Close"
          tabIndex={dismissable ? 0 : -1}
          onClick={() => dismissable && onOpenChange(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className={cn(
            "fixed inset-0 z-50 h-full w-full cursor-default bg-black/40 backdrop-blur-sm",
            backdropClassName,
          )}
        />
      ) : null}
      {open ? (
        <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          initial={reduce ? { opacity: 0 } : { x: offscreen }}
          animate={reduce ? { opacity: 1 } : { x: 0 }}
          exit={reduce ? { opacity: 0 } : { x: offscreen }}
          transition={reduce ? { duration: 0.2, ease: EASE_OUT } : SPRING_PANEL}
          className={cn(
            "fixed inset-y-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background shadow-2xl",
            side === "right"
              ? "right-0 border-l border-border"
              : "left-0 border-r border-border",
            className,
          )}
        >
          {children}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
