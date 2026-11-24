"use client";

import { useId, useRef, useState } from "react";
import { useControllable } from "@/lib/hooks/use-controllable";

export { useControllable };

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
