"use client";

import { motion, useIsPresent } from "motion/react";
import { useCallback, type ReactNode } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useTreemap } from "./context";
import type { TreemapTile } from "./model";

export function TreemapCell({
  tile,
  className,
  renderTile,
}: {
  tile: TreemapTile;
  className?: string;
  renderTile?: (tile: TreemapTile) => ReactNode;
}) {
  const {
    size,
    active,
    setActive,
    cursor,
    tiles,
    formatValue,
    tooltipId,
    tooltipOpen,
    setTooltipOpen,
    reduce,
    canHover,
    registerButton,
  } = useTreemap();
  const present = useIsPresent();
  const ref = useCallback(
    (node: HTMLButtonElement | null) => registerButton(tile.id, node),
    [tile.id, registerButton],
  );
  const selected = tooltipOpen && active?.id === tile.id;
  const width = tile.width / size.width;
  const height = tile.height / size.height;
  // Small tiles remain inspectable; their labels stay in the accessible name
  // and exact-data table rather than spilling into neighbouring rectangles.
  const showLabel = tile.width >= 52 && tile.height >= 32;
  const showValue = tile.width >= 70 && tile.height >= 56;
  return (
    <motion.button
      ref={ref}
      type="button"
      data-treemap-tile={tile.id}
      layout={!reduce}
      inert={!present}
      aria-hidden={!present || undefined}
      tabIndex={present && tiles[cursor.activeIndex]?.id === tile.id ? 0 : -1}
      aria-label={[
        tile.path.join(" / "),
        formatValue(tile.value),
        `${(tile.share * 100).toFixed(1)}% of total`,
        tile.description,
      ]
        .filter(Boolean)
        .join(". ")}
      aria-describedby={present && selected ? tooltipId : undefined}
      className={cn(
        "absolute overflow-hidden border-2 border-background text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
        className,
      )}
      style={{
        left: `${(tile.x / size.width) * 100}%`,
        top: `${(tile.y / size.height) * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
        backgroundColor: tile.color,
        color: tile.textColor,
        borderRadius: 8,
        pointerEvents: present ? "auto" : "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: reduce ? { duration: 0 } : SPRING_LAYOUT,
        opacity: { type: "tween", duration: present ? 0.18 : 0.1, ease: EASE_OUT },
      }}
      onPointerEnter={(event) => {
        if (present && canHover && event.pointerType !== "touch") {
          setActive(tile.id);
          setTooltipOpen(true);
        }
      }}
      onPointerMove={(event) => {
        if (present && (event.pointerType === "touch" ? event.buttons === 1 : canHover)) {
          setActive(tile.id);
          setTooltipOpen(true);
        }
      }}
      onPointerDown={() => {
        if (present) {
          setActive(tile.id);
          setTooltipOpen(true);
        }
      }}
      onClick={() => {
        if (present) {
          setActive(tile.id);
          setTooltipOpen(true);
        }
      }}
      onFocus={() => {
        if (present) {
          cursor.moveTo(tile.id);
          setActive(tile.id);
          setTooltipOpen(true);
        }
      }}
    >
      <motion.span
        aria-hidden="true"
        layout={reduce ? false : "position"}
        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
        className="absolute inset-x-2 top-2 min-w-0 sm:inset-x-3 sm:top-3"
      >
        {renderTile ? (
          renderTile(tile)
        ) : showLabel ? (
          <>
            <span className="block truncate text-xs font-semibold sm:text-sm">{tile.label}</span>
            {showValue ? (
              <span className="mt-1 block truncate font-mono text-[10px] tabular-nums opacity-80 sm:text-xs">
                {formatValue(tile.value)}
              </span>
            ) : null}
          </>
        ) : null}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/10"
        initial={false}
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ type: "tween", duration: 0.1, ease: EASE_OUT }}
      />
    </motion.button>
  );
}
