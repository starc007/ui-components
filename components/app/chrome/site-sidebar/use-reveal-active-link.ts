"use client";

import { useLayoutEffect, useRef } from "react";

// Clearance for the sticky category tabs at the top of the desktop sidebar.
const STICKY_CLEARANCE = 64;

/**
 * Keep the current page's link in view when the list mounts or the route
 * changes. A fresh load, a reload or the phone sheet opening would otherwise
 * start the list at the top, far from the reader's place. A visible link is
 * left alone, so clicking an item never moves the list.
 */
export function useRevealActiveLink(href: string) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const link = Array.from(nav.querySelectorAll("a")).find(
      (anchor) => anchor.getAttribute("href") === href,
    );
    // A link inside a filtered-out group has no boxes to reveal.
    if (!link || link.getClientRects().length === 0) return;
    let scroller = nav.parentElement;
    while (scroller && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const view = scroller.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top >= view.top + STICKY_CLEARANCE && item.bottom <= view.bottom) return;
    scroller.scrollTop += item.top - view.top - (view.height - item.height) / 2;
  }, [href]);
  return ref;
}
