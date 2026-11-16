"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Plays a preview on its own: calls `tick` every `interval` ms while the
 * stage is on screen, the tab is visible, and nobody is hovering or focused
 * inside it. Off entirely with reduced motion. Spread the returned props on
 * the element that wraps the preview.
 */
export function useAutoplay(tick: () => void, interval: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as RefObject<Element>, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // The latest tick, so the timer never restarts when the callback changes.
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") tickRef.current();
    }, interval);
    return () => window.clearInterval(id);
  }, [inView, paused, reduce, interval]);

  return {
    ref,
    onPointerEnter: () => setPaused(true),
    onPointerLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
}
