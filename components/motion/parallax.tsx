"use client";

import {
  motion,
  type MotionStyle,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { type ReactNode, type RefObject, useRef } from "react";

import { cn } from "@/lib/utils";

// Soft follow so the drift trails the scroll smoothly; looser than the UI
// springs in lib/ease.ts on purpose.
const PARALLAX_SPRING = { stiffness: 120, damping: 30, mass: 0.6 };

export interface ParallaxProps {
  children: ReactNode;
  /**
   * Drift as a fraction of the element's travel through the viewport.
   * Positive moves with the scroll (foreground), negative against it
   * (background). ~0.1–0.5 reads best.
   */
  speed?: number;
  axis?: "x" | "y";
  /** Scroll container for contained scroll areas. Defaults to the viewport. */
  container?: RefObject<HTMLElement | null>;
  /** Spring-smooth the drift. Disabled automatically under reduced motion. */
  spring?: boolean;
  className?: string;
}

export function Parallax({
  children,
  speed = 0.3,
  axis = "y",
  container,
  spring = true,
  className,
}: ParallaxProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container,
    offset: ["start end", "end start"],
    // Run after paint so a container ref defined higher in the tree is hydrated;
    // otherwise framer falls back to the document and only the page scroll works.
    layoutEffect: false,
  });

  // progress 0→1 as the element crosses the viewport; map to a symmetric drift.
  const travel = speed * 100;
  const drift = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  const smoothed = useSpring(drift, PARALLAX_SPRING);
  const value = spring && !reduce ? smoothed : drift;

  const style: MotionStyle = reduce ? {} : axis === "x" ? { x: value } : { y: value };

  return (
    <motion.div ref={ref} style={style} className={cn(className)}>
      {children}
    </motion.div>
  );
}
