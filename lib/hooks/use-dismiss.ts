"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { inOtherLayer, type Layer, openLayer, ownsEscape } from "@/lib/layers";

/**
 * What the dismissing gesture does to the control it landed on.
 *
 * `"pass-through"` is the platform norm (native popover light-dismiss): the
 * tap closes the overlay *and* activates whatever was under it. Use
 * `"consume"` where the open overlay sits over or beside controls that would
 * be costly to trigger by accident - the dismissal then swallows the
 * activation too, so the gesture only closes.
 */
export type DismissBehavior = "pass-through" | "consume";

/** What closed the overlay: Escape, a pointerdown outside it, or focus leaving it. */
export type DismissReason = "escape" | "pointer" | "focus";

export interface DismissOptions {
  /** Default `"pass-through"`. */
  behavior?: DismissBehavior;
  /** Dismiss on Escape as well. Default true. */
  escape?: boolean;
  /** Dismiss when focus moves outside, as a combobox does on Tab. Default false. */
  focusOutside?: boolean;
  /**
   * Dismiss on a pointerdown outside. Default true. Turn it off for an overlay
   * whose own backdrop handles presses and only needs Escape and layering.
   */
  outsidePress?: boolean;
  /** Return true for an outside target that should *not* dismiss. */
  ignore?: (target: Element) => boolean;
}

// preventDefault on pointerdown does not suppress the click that follows, so
// consuming a gesture means swallowing that click itself. The swallower
// deliberately outlives the effect that installed it - the dismissal it
// belongs to has already unmounted or re-rendered by the time the click lands.
// It releases on that click, or on the next gesture if the pointer is dragged
// away and no click ever arrives, so it can never eat a later one. A keydown
// releases it too: a gesture that ends with neither a click nor a cancel would
// otherwise leave it armed, and the click Enter synthesizes on some focused
// control is not the one this dismissal was owed.
function consumeActivation(source: Event) {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    release();
  };
  const restart = (event: Event) => {
    if (event !== source) release();
  };
  const release = () => {
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", restart, true);
    window.removeEventListener("pointercancel", restart, true);
    window.removeEventListener("keydown", release, true);
  };
  window.addEventListener("click", swallow, true);
  window.addEventListener("pointerdown", restart, true);
  window.addEventListener("pointercancel", restart, true);
  window.addEventListener("keydown", release, true);
}

/**
 * Close an open overlay on Escape or a pointerdown outside `ref`. Pass `null`
 * for `ref` when what counts as inside isn't one element, and say so with
 * `ignore` instead.
 *
 * The pointerdown listener is capture-phase: a bubble-phase one is blinded by
 * any handler in between that stops propagation, and an overlay cannot know
 * what it is layered over.
 *
 * Each open dismissal is a layer in `lib/layers.ts`, so only the innermost
 * open overlay answers Escape (a menu inside a drawer closes, the drawer
 * stays), and a drawer's focus trap leaves focus in a menu it portaled out.
 */
export function useDismiss(
  open: boolean,
  onDismiss: (reason: DismissReason) => void,
  ref: RefObject<HTMLElement | SVGElement | null> | null,
  {
    behavior = "pass-through",
    escape: dismissOnEscape = true,
    focusOutside = false,
    outsidePress = true,
    ignore,
  }: DismissOptions = {},
) {
  // Read through refs, so a callback rebuilt each render neither re-binds the
  // listeners nor moves this layer to the top of the stack.
  const dismissRef = useRef(onDismiss);
  const ignoreRef = useRef(ignore);
  useLayoutEffect(() => {
    dismissRef.current = onDismiss;
    ignoreRef.current = ignore;
  });

  useEffect(() => {
    if (!open) return;
    const inside = (target: Node) =>
      Boolean(ref?.current?.contains(target)) ||
      (target instanceof Element && Boolean(ignoreRef.current?.(target)));
    const layer: Layer = { contains: inside, escape: dismissOnEscape };
    const closeLayer = openLayer(layer);
    const onKey = (event: KeyboardEvent) => {
      if (!dismissOnEscape || event.key !== "Escape" || !ownsEscape(layer, event)) return;
      event.preventDefault();
      dismissRef.current("escape");
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || inside(target)) return;
      // Outside this overlay, but inside another open one: the gesture is
      // that overlay's to answer, and swallowing its click from behind would
      // cost the user the control they actually aimed at.
      if (behavior === "consume" && !inOtherLayer(layer, target, { traps: false })) {
        consumeActivation(event);
      }
      dismissRef.current("pointer");
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Node && !inside(target)) dismissRef.current("focus");
    };
    window.addEventListener("keydown", onKey);
    if (outsidePress) window.addEventListener("pointerdown", onPointer, true);
    if (focusOutside) window.addEventListener("focusin", onFocus);
    return () => {
      closeLayer();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("focusin", onFocus);
    };
  }, [open, ref, behavior, dismissOnEscape, focusOutside, outsidePress]);
}
