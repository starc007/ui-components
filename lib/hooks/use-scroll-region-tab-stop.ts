"use client";

import { type RefObject, useEffect, useState } from "react";

// What a keyboard user can already Tab to inside the region.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const SCROLLS = /^(auto|scroll)$/;

/**
 * Whether `element` is a scroll region a keyboard user cannot reach: it
 * scrolls on some axis (a scrolling `overflow` with content past the edge) and
 * holds nothing focusable. That is axe's scrollable-region-focusable in both
 * its clauses — a region passes by being focusable itself or by containing
 * focusable content — and the rule Chrome and Firefox apply when they make
 * such a scroller focusable on their own.
 */
export function needsScrollRegionTabStop(element: HTMLElement) {
  const style = getComputedStyle(element);
  const scrolls =
    (SCROLLS.test(style.overflowY) &&
      element.scrollHeight > element.clientHeight) ||
    (SCROLLS.test(style.overflowX) &&
      element.scrollWidth > element.clientWidth);
  return scrolls && element.querySelector(FOCUSABLE_SELECTOR) === null;
}

/**
 * Tab stop for a scroll container: `0` while it needs one, else `undefined`.
 *
 * WebKit never makes a scroller focusable, so without a tab stop a keyboard
 * user in Safari cannot reach content below its fold. A fixed `tabIndex={0}`
 * would add a silent extra stop wherever the box does not overflow or already
 * holds focusable content, so this follows the region instead: it re-checks
 * when the box resizes and when its content changes. Pass `enabled: false`
 * for a render path that is not a contained scroller.
 */
export function useScrollRegionTabStop(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      setNeeded(false);
      return;
    }
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setNeeded(needsScrollRegionTabStop(element)),
      );
    };
    const resize = new ResizeObserver(check);
    const observeBoxes = () => {
      resize.disconnect();
      resize.observe(element);
      for (const child of element.children) resize.observe(child);
    };
    const mutation = new MutationObserver((records) => {
      // Content can grow past the edge without the box resizing, so the
      // direct children are watched too; re-collect them when they change.
      if (
        records.some(
          (record) => record.type === "childList" && record.target === element,
        )
      ) {
        observeBoxes();
      }
      check();
    });
    observeBoxes();
    mutation.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    check();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [ref, enabled]);

  return needed ? 0 : undefined;
}
