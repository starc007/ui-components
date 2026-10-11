"use client";

import { arc, useAnimate, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface BounceSidebarItem {
  id: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

export interface BounceSidebarProps {
  items: BounceSidebarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  indicatorClassName?: string;
}

const DOT_SIZE = 6;

// A compact, lightly underdamped spring gives the dot a quick landing without
// turning the sidebar into a playful toy. The sideways arc carries the bounce.
const BOUNCE_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 18,
  mass: 0.3,
} as const;

// The dot hops sideways, away from the labels. arc() bends proportionally to
// the distance travelled, so cap it: adjacent rows get a ~5px hop and a long
// jump peaks near 20px instead of swinging out of the sidebar.
const ARC_MAX_STRENGTH = 0.26;
const ARC_MAX_BULGE = 40;

export function BounceSidebar({
  items,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Sidebar navigation",
  className,
  listClassName,
  itemClassName,
  indicatorClassName,
}: BounceSidebarProps) {
  const reduce = useReducedMotion();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items[0]?.id ?? "",
  );
  const requestedValue = value ?? internalValue;
  const selectedValue = items.some((item) => item.id === requestedValue)
    ? requestedValue
    : (items[0]?.id ?? "");
  const selectedIndex = items.findIndex((item) => item.id === selectedValue);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const selectedValueRef = useRef(selectedValue);
  const previousIndexRef = useRef(selectedIndex);
  const hasPositionRef = useRef(false);
  const dotYRef = useRef(0);
  const [dot, animateDot] = useAnimate<HTMLSpanElement>();
  selectedValueRef.current = selectedValue;

  const placeDot = useCallback(
    (destinationY: number) => {
      if (!dot.current) return;
      animateDot(dot.current, { x: 0, y: destinationY }, { duration: 0 });
      dotYRef.current = destinationY;
      hasPositionRef.current = true;
    },
    [animateDot, dot],
  );

  const snapIndicator = useCallback(() => {
    const selectedItem = itemRefs.current.get(selectedValueRef.current);
    if (!selectedItem) return;
    placeDot(
      selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2,
    );
  }, [placeDot]);

  const positionIndicator = useCallback(
    (shouldAnimate: boolean) => {
      const selectedItem = itemRefs.current.get(selectedValue);
      if (!selectedItem) return;

      const destinationY =
        selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2;

      if (!hasPositionRef.current || reduce || !shouldAnimate || !dot.current) {
        placeDot(destinationY);
        previousIndexRef.current = selectedIndex;
        return;
      }

      const distance = destinationY - dotYRef.current;
      const travel = Math.abs(distance);
      const longJumpProgress = Math.min(1, Math.max(0, (travel - 48) / 120));
      dotYRef.current = destinationY;

      animateDot(
        dot.current,
        { x: 0, y: destinationY },
        {
          ...BOUNCE_SPRING,
          stiffness: BOUNCE_SPRING.stiffness - 60 * longJumpProgress,
          damping: BOUNCE_SPRING.damping + longJumpProgress,
          mass: BOUNCE_SPRING.mass + 0.15 * longJumpProgress,
          path: arc({
            strength: Math.min(ARC_MAX_STRENGTH, ARC_MAX_BULGE / travel),
            // Relative to the direction of travel, so both directions
            // bulge to the screen left, away from the labels.
            direction: distance > 0 ? "ccw" : "cw",
          }),
        },
      );

      previousIndexRef.current = selectedIndex;
    },
    [animateDot, dot, placeDot, reduce, selectedIndex, selectedValue],
  );

  useLayoutEffect(() => {
    const shouldAnimate =
      hasPositionRef.current && previousIndexRef.current !== selectedIndex;
    positionIndicator(shouldAnimate);
  }, [positionIndicator, selectedIndex]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(snapIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [snapIndicator]);

  const selectItem = (id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  };

  return (
    <nav aria-label={ariaLabel} className={cn("relative", className)}>
      <ul
        ref={listRef}
        className={cn("relative flex list-none flex-col gap-1.5 pl-6", listClassName)}
      >
        {selectedIndex >= 0 ? (
          <li
            aria-hidden="true"
            role="presentation"
            className="pointer-events-none absolute inset-0"
          >
            <span
              ref={dot}
              className={cn(
                "absolute top-0 left-3 h-1.5 w-1.5 rounded-full bg-primary",
                indicatorClassName,
              )}
            />
          </li>
        ) : null}

        {items.map((item) => {
          const active = item.id === selectedValue;
          const content = (
            <>
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </>
          );
          const interactiveClasses = cn(
            "flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            active
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            item.disabled ? "cursor-not-allowed opacity-40" : undefined,
            itemClassName,
          );

          return (
            <li
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              className="relative"
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.target}
                  rel={
                    item.rel ??
                    (item.target === "_blank" ? "noreferrer noopener" : undefined)
                  }
                  aria-current={active ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  data-active={active || undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    selectItem(item.id);
                  }}
                  className={interactiveClasses}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={item.disabled}
                  aria-current={active ? "page" : undefined}
                  data-active={active || undefined}
                  onClick={() => selectItem(item.id)}
                  className={interactiveClasses}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
