"use client";

import { useInView, useReducedMotion } from "motion/react";
import { createContext, type RefObject, useContext, useEffect, useRef, useState } from "react";

/**
 * Lets a parent decide when previews play. The micro interactions gallery
 * provides it, so its cards start still and play only from their play
 * button. Without it a preview plays on its own.
 */
export const AutoplayContext = createContext<{ playing: boolean } | null>(null);

/**
 * Plays a preview: calls `tick` every `interval` ms while the stage is on
 * screen and the tab is visible. Under an AutoplayContext it plays only
 * while `playing` is set; on its own it plays unless someone is hovering or
 * focused inside it. Off entirely with reduced motion. Spread the returned
 * props on the element that wraps the preview.
 */
export function useAutoplay(tick: () => void, interval: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as RefObject<Element>, { amount: 0.5 });
  const reduce = useReducedMotion();
  const control = useContext(AutoplayContext);
  const [paused, setPaused] = useState(false);
  // The latest tick, so the timer never restarts when the callback changes.
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  const running = control ? control.playing : !paused;

  useEffect(() => {
    if (!inView || !running || reduce) return;
    // The first step plays right away, so pressing play answers at once.
    if (control) tickRef.current();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") tickRef.current();
    }, interval);
    return () => window.clearInterval(id);
  }, [inView, running, reduce, interval, control]);

  return {
    ref,
    onPointerEnter: () => setPaused(true),
    onPointerLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
}
