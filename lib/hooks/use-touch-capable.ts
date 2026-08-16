"use client";

import { useEffect, useState } from "react";

/**
 * Returns true on devices that can be touched, whatever else they claim.
 *
 * This is not the inverse of `useHoverCapable`: iPadOS Safari browses
 * desktop-class and answers `(hover: hover) and (pointer: fine)` with true
 * while a finger is the only input there is, so anything that treats
 * hover-capable as "no touch here" strands every iPad. Gate the *touch path*
 * of an interaction on this hook and leave hover-only polish on
 * `useHoverCapable`, so a component that opens on hover also opens on tap.
 */
export function useTouchCapable() {
  const [canTouch, setCanTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(any-pointer: coarse)");
    // iPadOS disguises its pointer media queries; maxTouchPoints it reports
    // honestly, which is what makes it the standard iPad tell.
    const update = () =>
      setCanTouch(Boolean(mq?.matches) || navigator.maxTouchPoints > 0);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  return canTouch;
}
