"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { cycleTab, focusFirstIn } from "@/lib/focusable";
import { inLayerAbove, type Layer, openLayer, ownsEscape, trapAbove } from "@/lib/layers";
import { lockScroll } from "@/lib/scroll-lock";

const inertOwners = new Map<
  HTMLElement,
  { count: number; previous: boolean }
>();

/** A portal root owns sibling inertness and scroll locking until its open state ends. */
export function useModalScope(
  open: boolean,
  root: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open || !root.current || !panel.current) return;
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const siblings = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== root.current,
    );
    for (const element of siblings) {
      const owner = inertOwners.get(element) ?? {
        count: 0,
        previous: element.inert,
      };
      owner.count += 1;
      inertOwners.set(element, owner);
      element.inert = true;
    }
    const unlockScroll = lockScroll();
    const layer: Layer = {
      contains: (target) => Boolean(root.current?.contains(target)),
      traps: true,
    };
    const closeLayer = openLayer(layer);
    focusFirstIn(panel.current);
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || root.current?.inert) return;
      if (panel.current?.contains(target)) return;
      if (inLayerAbove(layer, target) || trapAbove(layer)) return;
      focusFirstIn(panel.current);
    };
    const onKey = (event: KeyboardEvent) => {
      if (root.current?.inert) return;
      if (event.key === "Escape") {
        if (!ownsEscape(layer, event)) return;
        event.preventDefault();
        event.stopPropagation();
        close.current();
        return;
      }
      const active = document.activeElement;
      if (event.defaultPrevented || (active && inLayerAbove(layer, active))) return;
      cycleTab(event, panel.current);
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onKey);
      closeLayer();
      for (const element of siblings) {
        const owner = inertOwners.get(element);
        if (owner && --owner.count === 0) {
          element.inert = owner.previous;
          inertOwners.delete(element);
        }
      }
      unlockScroll();
      if (returnFocus?.isConnected && !returnFocus.closest("[inert]"))
        returnFocus.focus({ preventScroll: true });
    };
  }, [open, root, panel]);
}
