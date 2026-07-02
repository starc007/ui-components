import { type RefObject, useEffect } from "react";

/**
 * Close an open overlay on Escape or a pointerdown outside `ref`. `onDismiss`
 * must be stable (wrap in useCallback) so the listeners aren't re-bound every
 * render while open.
 */
export function useDismiss(
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onDismiss, ref]);
}
