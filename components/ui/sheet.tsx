"use client";

import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heights (0-1 = fraction of viewport, or "auto" for content height). First entry is the default. */
  snapPoints?: (number | "auto")[];
  defaultSnap?: number;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Min drag distance (px) past current snap to dismiss. */
  dismissThreshold?: number;
}

export function Sheet({
  open,
  onOpenChange,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  title,
  description,
  children,
  className,
  dismissThreshold = 120,
}: SheetProps) {
  const [snap, setSnap] = useState(defaultSnap);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);

  useEffect(() => {
    if (open) setSnap(defaultSnap);
  }, [open, defaultSnap]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Overlay opacity scales with drag progress.
  const overlayOpacity = useTransform(y, (v) => {
    const h = heightRef.current || 600;
    return Math.max(0, 1 - v / h);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Strong downward fling or large drag → dismiss.
    if (velocity > 600 || offset > dismissThreshold) {
      // Try snapping to a smaller snap first; if already smallest, dismiss.
      const smallerSnaps = snapPoints
        .map((_, i) => i)
        .filter((i) => i < snap);
      if (smallerSnaps.length && velocity < 800 && offset < dismissThreshold * 1.6) {
        setSnap(smallerSnaps[smallerSnaps.length - 1]);
      } else {
        onOpenChange(false);
      }
      return;
    }

    // Strong upward fling → next snap.
    if (velocity < -500) {
      const next = Math.min(snapPoints.length - 1, snap + 1);
      setSnap(next);
      return;
    }

    // Otherwise snap to nearest by current offset.
    if (offset > 80 && snap > 0) setSnap(snap - 1);
    else if (offset < -80 && snap < snapPoints.length - 1) setSnap(snap + 1);
  };

  const snapValue = snapPoints[snap];
  const heightStyle =
    snapValue === "auto"
      ? { maxHeight: "92vh" }
      : { height: `${snapValue * 100}vh` };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ opacity: overlayOpacity }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            ref={sheetRef}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.4 }}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            style={{ y, ...heightStyle }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.6 }}
            onLayoutAnimationStart={() => {
              if (sheetRef.current) heightRef.current = sheetRef.current.offsetHeight;
            }}
            onAnimationComplete={() => {
              if (sheetRef.current) heightRef.current = sheetRef.current.offsetHeight;
            }}
            className={cn(
              "absolute bottom-0 left-0 right-0 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-2xl will-change-transform",
              "glass-strong",
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex cursor-grab touch-none flex-col items-center px-4 pb-2 pt-3 active:cursor-grabbing"
            >
              <div className="h-1.5 w-10 rounded-full bg-(--color-fg-muted)/40" />
              {title || description ? (
                <div className="mt-3 w-full">
                  {title ? <h2 className="text-base font-semibold text-(--color-fg)">{title}</h2> : null}
                  {description ? <p className="mt-0.5 text-sm text-(--color-fg-muted)">{description}</p> : null}
                </div>
              ) : null}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
