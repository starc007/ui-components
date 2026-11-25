"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * The natural size of whatever the island shows, so the shell can spring its
 * real width and height to it (no scale, so text never stretches). Measured
 * once before paint, then on every resize as content swaps.
 */
export function useContentSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const next = { width: element.offsetWidth, height: element.offsetHeight };
      setSize((current) =>
        current?.width === next.width && current.height === next.height ? current : next,
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
