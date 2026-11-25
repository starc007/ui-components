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
import { EASE_OUT, SPRING_MORPH } from "@/lib/ease";
import { cn } from "@/lib/utils";

// The bottom edge glides to the new size; a little quicker when shrinking,
// since the content inside has already gone.
const GROW = { duration: 0.3, ease: EASE_OUT } as const;
const SHRINK = { duration: 0.24, ease: EASE_OUT } as const;

export interface ClipResizeFrameProps extends Omit<HTMLMotionProps<"div">, "children" | "style"> {
  style?: CSSProperties;
  /**
   * Which size follows the content. "y": the bottom edge glides as the height
   * changes. "x": both ends glide in or out from the centre as the width
   * changes, on a morph spring, for pills and chips. Default: "y"
   */
  axis?: "x" | "y";
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
  axis = "y",
  radius = 16,
  className,
  contentClassName,
  style,
  children,
  ...props
}: ClipResizeFrameProps) {
  const reduce = useReducedMotion() ?? false;
  const horizontal = axis === "x";
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // How much of the surface (px) is hidden right now: at the bottom, or split
  // evenly between the two ends.
  const gap = useMotionValue(0);
  const clip = (value: number, round: number) =>
    horizontal
      ? `inset(0 ${value / 2}px 0 ${value / 2}px round ${round}px)`
      : `inset(0 0 ${value}px 0 round ${round}px)`;
  const frameClip = useTransform(gap, (value) =>
    Math.abs(value) > 0.5 ? clip(value, radius) : "none",
  );
  const surfaceClip = useTransform(gap, (value) =>
    Math.abs(value) > 0.5 ? clip(value, radius - 1) : "none",
  );

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const content = contentRef.current;
    if (!surface || !content || typeof ResizeObserver === "undefined") return;

    const measure = () => (horizontal ? content.offsetWidth : content.offsetHeight);
    const side = horizontal ? "width" : "height";
    let last = measure();
    // While shrinking, the surface keeps its old size so the edge has
    // somewhere to glide from; null when the surface sizes to its content.
    let held: number | null = null;
    let controls: AnimationPlaybackControls | undefined;

    const release = () => {
      held = null;
      surface.style[side] = "";
      gap.set(0);
    };

    // Runs after layout and before paint, so the held size lands in the
    // same frame as the content change: the edge never jumps.
    const observer = new ResizeObserver(() => {
      const next = measure();
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
      surface.style[side] = held === null ? "" : `${held}px`;
      gap.set(from - visible);
      controls = animate(gap, from - next, {
        ...(horizontal ? SPRING_MORPH : next < visible ? SHRINK : GROW),
        // The edge has reached the content: hand the size back to layout.
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
  }, [gap, reduce, horizontal]);

  return (
    <motion.div
      {...props}
      style={{ ...style, borderRadius: radius, clipPath: frameClip }}
      className={cn("bg-border p-px", horizontal && "w-fit", className)}
    >
      <motion.div
        ref={surfaceRef}
        style={{ borderRadius: radius - 1, clipPath: surfaceClip }}
        // Held wider than its content while shrinking, the surface keeps the
        // content centred, so the two ends close in on it evenly.
        className={cn("overflow-hidden bg-background", horizontal && "flex justify-center")}
      >
        <div ref={contentRef} className={cn(horizontal && "w-max shrink-0", contentClassName)}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
