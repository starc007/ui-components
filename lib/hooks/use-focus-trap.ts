"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { cycleTab, focusFirstIn } from "@/lib/focusable";
import { inLayerAbove, type Layer, openLayer, ownsEscape, trapAbove } from "@/lib/layers";

export interface FocusTrapOptions {
  /** Called on Escape while this is the innermost open layer. */
  onEscape?: () => void;
}

/**
 * Moves focus into `panel` when `open` turns true, keeps Tab cycling inside it,
 * pulls focus back if it lands outside, and returns focus to whatever held it
 * before opening once `open` turns false.
 *
 * Layers opened on top (a menu portaled out of a drawer, a sheet opened from
 * it) keep focus and Escape until they close: see `lib/layers.ts`.
 *
 * For overlays rendered in place, where `useModalScope` cannot inert the rest
 * of the page. Pass `open` rather than presence: an exiting panel is already
 * inert through `PresenceGate`, so the trap releases with the same commit.
 * Give the panel `tabIndex={-1}` so it can take focus when it holds nothing
 * focusable.
 */
export function useFocusTrap(
  open: boolean,
  panel: RefObject<HTMLElement | null>,
  { onEscape }: FocusTrapOptions = {},
) {
  const escapeRef = useRef(onEscape);
  useLayoutEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!open || !panel.current) return;
    const layer: Layer = {
      contains: (target) => Boolean(panel.current?.contains(target)),
      traps: true,
      get escape() {
        return Boolean(escapeRef.current);
      },
    };
    const closeLayer = openLayer(layer);
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (!panel.current.contains(document.activeElement)) focusFirstIn(panel.current);

    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !panel.current) return;
      if (panel.current.closest("[inert]") || panel.current.contains(target)) return;
      if (inLayerAbove(layer, target) || trapAbove(layer)) return;
      focusFirstIn(panel.current);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!escapeRef.current || !ownsEscape(layer, event)) return;
        event.preventDefault();
        escapeRef.current();
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
      if (returnFocus?.isConnected && !returnFocus.closest("[inert]"))
        returnFocus.focus({ preventScroll: true });
    };
  }, [open, panel]);
}
