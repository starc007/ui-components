"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Hand focus back when an overlay closes, to the element that held it when
 * the overlay opened. WebKit never focuses a clicked button, and closing an
 * overlay unmounts or inerts whatever inside it held focus, so without this
 * Safari leaves focus on <body> after every close.
 *
 * The hand-back only runs when focus was lost with the overlay: on <body>, or
 * still inside one of `layers` — every element the overlay renders, backdrop
 * included, since a pressed backdrop button holds focus in Chrome. Focus the
 * user or the consumer already moved somewhere else stays there: an outside
 * click that focused a field, or an `onSelect` that focused its own target.
 *
 * When nothing usable held focus on open (<body>, or an element that has
 * since unmounted), focus goes to the element with `fallbackId`, if any.
 */
export function useFocusReturn(
  open: boolean,
  layers: readonly RefObject<HTMLElement | null>[],
  fallbackId?: string,
) {
  // Callers pass a fresh array each render; the effect must not re-run for it.
  const layersRef = useRef(layers);
  useLayoutEffect(() => {
    layersRef.current = layers;
  });

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    const previous =
      active instanceof HTMLElement && active !== document.body ? active : null;
    return () => {
      const current = document.activeElement;
      const lost =
        !current ||
        current === document.body ||
        layersRef.current.some((layer) => layer.current?.contains(current));
      if (!lost) return;
      const target = previous?.isConnected
        ? previous
        : fallbackId
          ? document.getElementById(fallbackId)
          : null;
      target?.focus({ preventScroll: true });
    };
  }, [open, fallbackId]);
}
