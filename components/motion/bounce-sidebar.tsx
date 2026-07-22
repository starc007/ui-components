"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
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

const DOT_SIZE = 8;
const DOT_OPTICAL_OFFSET = 1;

// A compact, lightly underdamped spring gives the dot a quick landing without
// turning the sidebar into a playful toy. The sideways arc carries the bounce.
const BOUNCE_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 18,
  mass: 0.3,
} as const;

function quadraticBezier(start: number, control: number, end: number, progress: number) {
  const remaining = 1 - progress;
  return (
    remaining * remaining * start +
    2 * remaining * progress * control +
    progress * progress * end
  );
}

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
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  selectedValueRef.current = selectedValue;

  const snapIndicator = useCallback(() => {
    const selectedItem = itemRefs.current.get(selectedValueRef.current);
    if (!selectedItem) return;

    animationRef.current?.stop();
    x.set(0);
    y.set(
      selectedItem.offsetTop +
        (selectedItem.offsetHeight - DOT_SIZE) / 2 +
        DOT_OPTICAL_OFFSET,
    );
    hasPositionRef.current = true;
  }, [x, y]);

  const positionIndicator = useCallback(
    (shouldAnimate: boolean) => {
      const selectedItem = itemRefs.current.get(selectedValue);
      if (!selectedItem) return;

      const destinationY =
        selectedItem.offsetTop +
        (selectedItem.offsetHeight - DOT_SIZE) / 2 +
        DOT_OPTICAL_OFFSET;

      animationRef.current?.stop();

      if (!hasPositionRef.current || reduce || !shouldAnimate) {
        x.set(0);
        y.set(destinationY);
        hasPositionRef.current = true;
        previousIndexRef.current = selectedIndex;
        return;
      }

      const startY = y.get();
      const distance = destinationY - startY;
      const controlX = -Math.min(28, Math.max(8, Math.abs(distance) * 0.25));
      const controlY = destinationY;

      animationRef.current = animate(0, 1, {
        ...BOUNCE_SPRING,
        onUpdate: (progress) => {
          x.set(quadraticBezier(0, controlX, 0, progress));
          y.set(quadraticBezier(startY, controlY, destinationY, progress));
        },
        onComplete: () => {
          x.set(0);
          y.set(destinationY);
        },
      });

      previousIndexRef.current = selectedIndex;
    },
    [reduce, selectedIndex, selectedValue, x, y],
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

  useLayoutEffect(
    () => () => {
      animationRef.current?.stop();
    },
    [],
  );

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
            className="pointer-events-none absolute inset-0 "
          >
            <motion.span
              style={{ x, y }}
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
