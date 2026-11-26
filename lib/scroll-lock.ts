"use client";

import { useEffect } from "react";

export interface ScrollLockOptions {
  /**
   * Pin the body with `position: fixed` and restore the scroll offset on
   * release. iOS Safari still scrolls an `overflow: hidden` body under a
   * touch drag, so full-screen sheets that take touch gestures need this.
   */
  fixed?: boolean;
}

// Reference-counted, so overlays that close out of order never unlock the
// page under one that is still open. The first lock picks the technique.
let owners = 0;
let restore: (() => void) | null = null;

function apply({ fixed = false }: ScrollLockOptions) {
  const root = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  const previous = {
    rootOverflow: root.style.overflow,
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
  };
  root.style.overflow = "hidden";
  body.style.overflow = "hidden";
  if (fixed) {
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
  }
  return () => {
    root.style.overflow = previous.rootOverflow;
    body.style.overflow = previous.overflow;
    if (!fixed) return;
    body.style.position = previous.position;
    body.style.top = previous.top;
    body.style.left = previous.left;
    body.style.right = previous.right;
    window.scrollTo(0, scrollY);
  };
}

/** Locks page scroll. Call the returned function to release this lock. */
export function lockScroll(options: ScrollLockOptions = {}) {
  if (owners++ === 0) restore = apply(options);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--owners === 0) {
      restore?.();
      restore = null;
    }
  };
}

/** Locks page scroll while `locked` is true. */
export function useScrollLock(locked: boolean, { fixed = false }: ScrollLockOptions = {}) {
  useEffect(() => {
    if (!locked) return;
    return lockScroll({ fixed });
  }, [locked, fixed]);
}
