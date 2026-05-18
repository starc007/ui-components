"use client";

import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heights (0-1 = fraction of viewport, or "auto"). First entry is default. */
  snapPoints?: (number | "auto")[];
  defaultSnap?: number;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Min drag distance (px) past current snap to dismiss. */
  dismissThreshold?: number;
}

export function BottomSheet({
  open,
  onOpenChange,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  title,
  description,
  children,
  className,
  dismissThreshold = 120,
}: BottomSheetProps) {
  const [snap, setSnap] = useState(defaultSnap);
  const dragY = useMotionValue(0);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Strong downward fling or large drag → dismiss.
    if (velocity > 600 || offset > dismissThreshold) {
      const smaller = snapPoints.map((_, i) => i).filter((i) => i < snap);
      if (smaller.length && velocity < 800 && offset < dismissThreshold * 1.6) {
        setSnap(smaller[smaller.length - 1]);
      } else {
        onOpenChange(false);
      }
      dragY.set(0);
      return;
    }

    // Strong upward fling → next snap.
    if (velocity < -500) {
      setSnap(Math.min(snapPoints.length - 1, snap + 1));
      dragY.set(0);
      return;
    }

    // Otherwise snap to nearest by current offset.
    if (offset > 80 && snap > 0) setSnap(snap - 1);
    else if (offset < -80 && snap < snapPoints.length - 1) setSnap(snap + 1);
    dragY.set(0);
  };

  const snapValue = snapPoints[snap];
  const heightStyle =
    snapValue === "auto" ? { maxHeight: "92vh" } : { height: `${snapValue * 100}vh` };

  return (
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-none fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onOpenChange(false)}
            className="pointer-events-auto absolute inset-0 bg-black/50 backdrop-blur-xl backdrop-saturate-150"
          />
          <motion.div
            ref={sheetRef}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.4 }}
            dragMomentum={false}
            onDrag={(_, info) => dragY.set(Math.max(0, info.offset.y))}
            onDragEnd={onDragEnd}
            initial={reduce ? { y: 0, opacity: 0 } : { y: "100%" }}
            animate={reduce ? { y: 0, opacity: 1 } : { y: 0 }}
            exit={reduce ? { y: 0, opacity: 0 } : { y: "100%" }}
            transition={
              reduce
                ? { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                : { type: "spring", stiffness: 420, damping: 40, mass: 0.5 }
            }
            onAnimationComplete={() => {
              if (sheetRef.current) heightRef.current = sheetRef.current.offsetHeight;
            }}
            style={heightStyle}
            className={cn(
              "pointer-events-auto absolute bottom-0 left-0 right-0 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-3xl will-change-transform",
              "border border-(--color-border-strong) bg-(--color-bg-elev) shadow-[0_-24px_60px_-12px_rgb(0_0_0/0.45)]",
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
