"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

/** Controlled/uncontrolled value with a stable setter. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = useState(defaultValue);
  const latest = useRef({ value, internal, onChange });
  useLayoutEffect(() => {
    latest.current = { value, internal, onChange };
  });
  const set = useCallback((next: T) => {
    const current = latest.current;
    if (current.value === undefined) setInternal(next);
    if ((current.value === undefined ? current.internal : current.value) !== next)
      current.onChange?.(next);
  }, []);
  return [value === undefined ? internal : value, set, setInternal] as const;
}

/**
 * The inspected category is held by id and resolved during render, so a
 * category that leaves the data clears the cursor instead of landing on a
 * neighbour, and one that comes back cannot revive it.
 */
export function useInspection({
  ids,
  activeId,
  defaultActiveId = null,
  onActiveChange,
}: {
  ids: readonly string[];
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
}) {
  const [requested, setActive, setInternal] = useControllable(
    activeId,
    defaultActiveId,
    onActiveChange,
  );
  if (activeId === undefined && requested !== null && !ids.includes(requested)) setInternal(null);
  const activeIndex = requested === null ? -1 : ids.indexOf(requested);
  const [open, setOpen] = useState(false);
  // A finger on the plot: inspection marks follow it directly instead of gliding.
  const [touching, setTouching] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  return {
    activeId: activeIndex >= 0 ? requested : null,
    activeIndex,
    setActive,
    open,
    setOpen,
    touching,
    setTouching,
    plotRef,
    tooltipId,
  };
}
