"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export type AvatarStackItem = {
  id: string;
  name: string;
  src?: string;
  fallback?: ReactNode;
  className?: string;
};

export interface AvatarStackProps {
  items: AvatarStackItem[];
  className?: string;
  itemClassName?: string;
  size?: number;
  max?: number;
  overlap?: number;
  spreadOnHover?: boolean;
}

export function AvatarStack({
  items,
  className,
  itemClassName,
  size = 44,
  max = 5,
  overlap = 14,
  spreadOnHover = true,
}: AvatarStackProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const visibleItems = items.slice(0, max);
  const remaining = Math.max(items.length - visibleItems.length, 0);
  const shouldSpread = spreadOnHover && canHover && !reduce;
  const step = Math.max(size - overlap, 10);
  const expandedStep = size + 6;
  const width = visibleItems.length
    ? size + Math.max(visibleItems.length - 1, 0) * step + (remaining ? step : 0)
    : 0;

  return (
    <ul
      className={cn("group relative inline-flex items-center", className)}
      style={{ minHeight: size, width }}
      aria-label={`${items.length} people`}
    >
      {visibleItems.map((item, index) => {
        const x = index * step;
        const hoverX = index * expandedStep;

        return (
          <motion.li
            key={item.id}
            initial={false}
            animate={{
              x,
              scale: 1,
            }}
            whileHover={
              shouldSpread
                ? {
                    x: hoverX,
                    y: -4,
                    scale: 1.04,
                  }
                : undefined
            }
            whileTap={reduce ? undefined : { scale: 0.96 }}
            transition={reduce ? { duration: 0 } : index === 0 ? SPRING_LAYOUT : SPRING_PRESS}
            className="absolute top-0 list-none"
            style={{ zIndex: visibleItems.length - index }}
          >
            <AvatarStackItemView
              item={item}
              size={size}
              className={cn(itemClassName, item.className)}
            />
          </motion.li>
        );
      })}

      {remaining ? (
        <motion.li
          initial={false}
          animate={{ x: visibleItems.length * step }}
          whileHover={shouldSpread ? { x: visibleItems.length * expandedStep, y: -2 } : undefined}
          transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="absolute top-0 list-none"
          style={{ zIndex: 0 }}
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-full border border-background/80 bg-muted text-xs font-semibold text-muted-foreground shadow-sm ring-2 ring-background",
              itemClassName,
            )}
            style={{ width: size, height: size }}
            title={`${remaining} more`}
          >
            +{remaining}
          </span>
        </motion.li>
      ) : null}
    </ul>
  );
}

function AvatarStackItemView({
  item,
  size,
  className,
}: {
  item: AvatarStackItem;
  size: number;
  className?: string;
}) {
  const fallback =
    item.fallback ??
    item.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <span
      title={item.name}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-background/80 bg-card text-sm font-medium text-foreground shadow-sm ring-2 ring-background",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {item.src ? (
        <span
          aria-hidden
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${item.src})` }}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </span>
  );
}
