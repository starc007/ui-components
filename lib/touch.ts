// Shared touch primitives. iOS and iPadOS run their own gestures on top of the
// page — the long-press selection callout, the system drag — and they win: once
// the platform claims a touch it cancels ours mid-gesture, so a press-and-hold
// or a drag simply dies. Surfaces that own their gesture have to opt out.

/**
 * Classes for a surface whose press, hold or drag we drive end to end. Kills
 * iOS's long-press callout, the selection it drags in with it, and the native
 * drag on iPadOS. Compose with `touch-none` when the surface also owns the
 * scroll axis — leave it off when the page must still scroll from there.
 */
export const TOUCH_GESTURE_CLASS =
  "select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]";

/**
 * Pointer capture, best effort. WebKit throws `NotFoundError` when the pointer
 * is already gone by the time the handler runs — routine on iOS, where the
 * system can claim the touch first — and an uncaught throw takes the rest of
 * the handler, the gesture included, down with it. Touch pointers carry
 * implicit capture anyway, so losing it is never fatal.
 */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

/** Release a capture taken with `capturePointer`, ignoring a stale pointer. */
export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}
