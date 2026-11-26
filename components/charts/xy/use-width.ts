"use client";

import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ElementSize = { width: number; height: number };

/**
 * Keeps `setSize` at `ref`'s rendered size. Zero sizes (a hidden plot) are
 * skipped, and an unchanged size keeps the previous object, so nothing
 * re-renders for a resize that changed nothing.
 */
export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  setSize: Dispatch<SetStateAction<ElementSize>>,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width > 0 && height > 0)
        setSize((size) =>
          size.width === width && size.height === height ? size : { width, height },
        );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, setSize]);
}

/** Pixel geometry keeps dots round and strokes even; nothing renders before the first measure. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
