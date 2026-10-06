"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTreemap } from "./context";
import type { TreemapTile } from "./model";
import { TreemapCell } from "./tile";

export interface TreemapPlotProps {
  /** Sets the plot height; default 20rem. The layout follows its measured dimensions. */
  className?: string;
  tileClassName?: string;
  /** Return presentation content only; each tile already owns its button and accessible name. */
  renderTile?: (tile: TreemapTile) => ReactNode;
}

export function TreemapPlot({ className, tileClassName, renderTile }: TreemapPlotProps) {
  const { tiles, items, plotRef, setSize, cursor, buttons, setActive, setTooltipOpen } =
    useTreemap();
  const layoutId = useId();
  const focusedId = useRef<string | null>(null);
  useLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const measure = () => {
      const { width, height } = plot.getBoundingClientRect();
      if (width > 0 && height > 0)
        setSize((size) =>
          size.width === width && size.height === height ? size : { width, height },
        );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);
    return () => observer.disconnect();
  }, [plotRef, setSize]);
  useLayoutEffect(() => {
    const id = focusedId.current;
    if (!id || tiles.some((tile) => tile.id === id)) return;
    focusedId.current = null;
    const lost = buttons.current.get(id);
    if (document.activeElement === lost || document.activeElement === document.body) {
      const replacement = tiles[cursor.activeIndex];
      if (replacement) buttons.current.get(replacement.id)?.focus();
      else plotRef.current?.focus();
    }
  }, [tiles, cursor.activeIndex, buttons, plotRef]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const id = event.target.dataset.treemapTile;
    const current = tiles.find((tile) => tile.id === id);
    if (!current) return;
    if (event.key === "Escape") {
      setTooltipOpen(false);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    let next = current;
    if (event.key === "Home") next = tiles[0];
    else if (event.key === "End") next = tiles[tiles.length - 1];
    else {
      const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
      const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const cx = current.x + current.width / 2;
      const cy = current.y + current.height / 2;
      let best = Number.POSITIVE_INFINITY;
      for (const tile of tiles) {
        const dx = tile.x + tile.width / 2 - cx;
        const dy = tile.y + tile.height / 2 - cy;
        const forward = (horizontal ? dx : dy) * direction;
        const cross = Math.abs(horizontal ? dy : dx);
        const score = forward + cross * 2;
        if (forward > 0.01 && score < best) {
          next = tile;
          best = score;
        }
      }
    }
    setTooltipOpen(true);
    if (next.id === current.id) setActive(current.id);
    else buttons.current.get(next.id)?.focus();
  };
  return (
    <LayoutGroup id={layoutId}>
      {/* biome-ignore lint/a11y/useSemanticElements: This group is a chart, not a collection of form fields. */}
      <div
        ref={plotRef}
        role="group"
        aria-label="Treemap tiles"
        tabIndex={-1}
        data-slot="treemap-plot"
        className={cn(
          "relative h-80 w-full min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        onKeyDown={onKeyDown}
        onFocus={(event) => {
          if (event.target instanceof HTMLButtonElement)
            focusedId.current = event.target.dataset.treemapTile ?? null;
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            focusedId.current = null;
            setTooltipOpen(false);
          }
        }}
        onPointerLeave={() => setTooltipOpen(false)}
      >
        <AnimatePresence initial={false}>
          {tiles.map((tile) => (
            <TreemapCell
              key={tile.id}
              tile={tile}
              className={tileClassName}
              renderTile={renderTile}
            />
          ))}
        </AnimatePresence>
        {!tiles.length ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {items.length ? "No positive values" : "No treemap data"}
          </p>
        ) : null}
      </div>
    </LayoutGroup>
  );
}
