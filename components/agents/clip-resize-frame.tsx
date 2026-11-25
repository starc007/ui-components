"use client";

import {
  type AnimationPlaybackControls,
  animate,
  type HTMLMotionProps,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

// The bottom edge glides to the new size; a little quicker when shrinking,
// since the content inside has already gone.
const GROW = { duration: 0.3, ease: EASE_OUT } as const;
const SHRINK = { duration: 0.24, ease: EASE_OUT } as const;

export interface ClipResizeFrameProps extends Omit<HTMLMotionProps<"div">, "children" | "style"> {
  style?: CSSProperties;
  /** Outer corner radius in px. The surface inside uses one less. */
  radius?: number;
  /** Classes for the content box (padding goes here). */
  contentClassName?: string;
  children: ReactNode;
}

/**
 * A bordered card whose bottom edge glides when its content grows or shrinks,
 * without animating height. The layout changes at once; a clip on the card
 * hides the difference and slides it away. The border is the 1px gap between
 * two clipped layers (the frame in the border colour, the surface inside it),
 * so the bottom line travels with the edge instead of being clipped off.
 */
export function ClipResizeFrame({
  radius = 16,
  className,
  contentClassName,
  style,
  children,
  ...props
}: ClipResizeFrameProps) {
  const reduce = useReducedMotion() ?? false;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // How much of the surface (px) is hidden at the bottom right now.
  const gap = useMotionValue(0);
  const frameClip = useTransform(gap, (value) =>
    value > 0.5 ? `inset(0 0 ${value}px 0 round ${radius}px)` : "none",
  );
  const surfaceClip = useTransform(gap, (value) =>
    value > 0.5 ? `inset(0 0 ${value}px 0 round ${radius - 1}px)` : "none",
  );

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const content = contentRef.current;
    if (!surface || !content || typeof ResizeObserver === "undefined") return;

    let last = content.offsetHeight;
    // While shrinking, the surface keeps its old height so the edge has
    // somewhere to glide from; null when the surface sizes to its content.
    let held: number | null = null;
    let controls: AnimationPlaybackControls | undefined;

    const release = () => {
      held = null;
      surface.style.height = "";
      gap.set(0);
    };

    // Runs after layout and before paint, so the held height lands in the
    // same frame as the content change: the edge never jumps.
    const observer = new ResizeObserver(() => {
      const next = content.offsetHeight;
      if (next === last) return;
      const visible = (held ?? last) - gap.get();
      last = next;
      controls?.stop();

      if (reduce) {
        release();
        return;
      }

      const from = Math.max(next, visible);
      held = from > next ? from : null;
      surface.style.height = held === null ? "" : `${held}px`;
      gap.set(from - visible);
      controls = animate(gap, from - next, {
        ...(next < visible ? SHRINK : GROW),
        // The edge has reached the content: hand the height back to layout.
        onComplete: () => {
          if (held !== null) release();
        },
      });
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      controls?.stop();
    };
  }, [gap, reduce]);

  return (
    <motion.div
      {...props}
      style={{ ...style, borderRadius: radius, clipPath: frameClip }}
      className={cn("bg-border p-px", className)}
    >
      <motion.div
        ref={surfaceRef}
        style={{ borderRadius: radius - 1, clipPath: surfaceClip }}
        className="overflow-hidden bg-background"
      >
        <div ref={contentRef} className={contentClassName}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
