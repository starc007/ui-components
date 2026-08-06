"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type MorphingTabsItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export type MorphingTabsClassNames = {
  root?: string;
  rail?: string;
  tab?: string;
  activeTab?: string;
  icon?: string;
  label?: string;
  close?: string;
  content?: string;
};

export interface MorphingTabsProps {
  items: MorphingTabsItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  /** Called once after a pointer drag or keyboard reorder completes. */
  onOrderChange?: (ids: string[]) => void;
  /** Enables the close affordance on every tab when provided. */
  onClose?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
  classNames?: MorphingTabsClassNames;
}

type DragState = {
  id: string;
  pointerId: number;
  originX: number;
  lastX: number;
  startLeft: number;
  moved: boolean;
  startOrder: string[];
};

const DRAG_THRESHOLD = 5;
const TAB_SURFACE_WIDTH = 176;
const TAB_SURFACE_RADIUS = 24;
const RAIL_HEIGHT = 80;
const SURFACE_INSET = 16;
const LIQUID_JOIN = 24;

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function liquidTabPath(tabLeft: number, surfaceWidth: number) {
  const panelLeft = SURFACE_INSET;
  const panelRight = surfaceWidth - SURFACE_INSET;
  const tabRight = tabLeft + TAB_SURFACE_WIDTH;
  const top = RAIL_HEIGHT - 56;
  const bottom = RAIL_HEIGHT;
  const leftJoin = Math.max(panelLeft, tabLeft - LIQUID_JOIN);
  const rightJoin = Math.min(panelRight, tabRight + LIQUID_JOIN);
  const leftDepth = Math.min(LIQUID_JOIN, tabLeft - leftJoin);
  const rightDepth = Math.min(LIQUID_JOIN, rightJoin - tabRight);
  const leftControl = leftDepth * 0.55;
  const rightControl = rightDepth * 0.55;

  return [
    `M${panelLeft} ${bottom + 8}`,
    `V${bottom}`,
    `H${leftJoin}`,
    `C${leftJoin + leftControl} ${bottom} ${tabLeft} ${bottom - leftDepth + leftControl} ${tabLeft} ${bottom - leftDepth}`,
    `V${top + TAB_SURFACE_RADIUS}`,
    `Q${tabLeft} ${top} ${tabLeft + TAB_SURFACE_RADIUS} ${top}`,
    `H${tabRight - TAB_SURFACE_RADIUS}`,
    `Q${tabRight} ${top} ${tabRight} ${top + TAB_SURFACE_RADIUS}`,
    `V${bottom - rightDepth}`,
    `C${tabRight} ${bottom - rightDepth + rightControl} ${rightJoin - rightControl} ${bottom} ${rightJoin} ${bottom}`,
    `H${panelRight}`,
    `V${bottom + 8}`,
    "Z",
  ].join(" ");
}

export function MorphingTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  onOrderChange,
  onClose,
  ariaLabel = "Tabs",
  className,
  classNames,
}: MorphingTabsProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const [order, setOrder] = useState(itemIds);
  const orderRef = useRef(order);
  orderRef.current = order;

  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? itemIds[0] ?? null,
  );
  const controlled = value !== undefined;
  const currentValue = controlled ? (value ?? null) : internalValue;

  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [liquidDragLeft, setLiquidDragLeft] = useState<number | null>(null);
  const [surfaceWidth, setSurfaceWidth] = useState(0);
  const [settledTabLeft, setSettledTabLeft] = useState(SURFACE_INSET);

  useEffect(() => {
    setOrder((current) => {
      const available = new Set(itemIds);
      const retained = current.filter((id) => available.has(id));
      const retainedSet = new Set(retained);
      const added = itemIds.filter((id) => !retainedSet.has(id));
      const next = [...retained, ...added];

      return sameOrder(current, next) ? current : next;
    });
  }, [itemIds]);

  const orderedItems = useMemo(
    () =>
      order.flatMap((id) => {
        const item = itemMap.get(id);
        return item ? [item] : [];
      }),
    [itemMap, order],
  );

  const firstEnabledItem =
    orderedItems.find((item) => !item.disabled) ?? orderedItems[0] ?? null;
  const activeItem =
    currentValue && itemMap.has(currentValue)
      ? itemMap.get(currentValue) ?? null
      : firstEnabledItem;
  const activeId = activeItem?.id ?? null;
  const activeOrderIndex = activeId ? order.indexOf(activeId) : -1;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      setSurfaceWidth(root.clientWidth);
      const activeNode = activeId ? tabRefs.current[activeId] : null;
      if (activeNode && activeOrderIndex >= 0 && liquidDragLeft === null) {
        setSettledTabLeft(activeNode.offsetLeft);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [activeId, activeOrderIndex, liquidDragLeft]);

  const liquidSurfacePath = useMemo(() => {
    if (!activeItem || surfaceWidth <= SURFACE_INSET * 2) return null;
    return liquidTabPath(liquidDragLeft ?? settledTabLeft, surfaceWidth);
  }, [activeItem, liquidDragLeft, settledTabLeft, surfaceWidth]);

  const setActive = useCallback(
    (id: string | null) => {
      if (id && itemMap.get(id)?.disabled) return;
      if (!controlled) setInternalValue(id);
      onValueChange?.(id);
    },
    [controlled, itemMap, onValueChange],
  );

  useEffect(() => {
    if (currentValue && itemMap.has(currentValue)) return;
    if (firstEnabledItem && firstEnabledItem.id !== currentValue) {
      setActive(firstEnabledItem.id);
    }
  }, [currentValue, firstEnabledItem, itemMap, setActive]);

  const commitOrder = useCallback(
    (next: string[], notify: boolean) => {
      orderRef.current = next;
      setOrder((current) => (sameOrder(current, next) ? current : next));
      if (notify) onOrderChange?.(next);
    },
    [onOrderChange],
  );

  const getDropIndex = useCallback((clientX: number, draggedId: string) => {
    const otherIds = orderRef.current.filter((id) => id !== draggedId);

    for (let index = 0; index < otherIds.length; index += 1) {
      const rect = tabRefs.current[otherIds[index]]?.getBoundingClientRect();
      if (rect && clientX < rect.left + rect.width / 2) return index;
    }

    return otherIds.length;
  }, []);

  const moveBy = useCallback(
    (id: string, direction: -1 | 1) => {
      const current = orderRef.current;
      const index = current.indexOf(id);
      const nextIndex = index + direction;

      if (
        index === -1 ||
        nextIndex < 0 ||
        nextIndex >= current.length ||
        itemMap.get(id)?.disabled
      ) {
        return;
      }

      const next = current.slice();
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      commitOrder(next, true);
    },
    [commitOrder, itemMap],
  );

  const startDrag = useCallback(
    (id: string, event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || itemMap.get(id)?.disabled) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        id,
        pointerId: event.pointerId,
        originX: event.clientX,
        lastX: event.clientX,
        startLeft: event.currentTarget.offsetLeft,
        moved: false,
        startOrder: orderRef.current.slice(),
      };
      setDraggingId(id);
      setDragOffset(0);
      setLiquidDragLeft(event.currentTarget.offsetLeft);
      setActive(id);
    },
    [itemMap, setActive],
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const offset = event.clientX - drag.originX;
      drag.lastX = event.clientX;
      const nextLiquidLeft = Math.max(
        SURFACE_INSET,
        Math.min(
          surfaceWidth - SURFACE_INSET - TAB_SURFACE_WIDTH,
          drag.startLeft + event.clientX - drag.originX,
        ),
      );
      setLiquidDragLeft(nextLiquidLeft);
      if (!drag.moved && Math.abs(offset) < DRAG_THRESHOLD) return;
      drag.moved = true;

      const current = orderRef.current;
      const currentIndex = current.indexOf(drag.id);

      const constrainedOffset =
        current.length <= 1
          ? 0
          : currentIndex === 0
            ? Math.max(0, offset)
            : currentIndex === current.length - 1
              ? Math.min(0, offset)
              : offset;

      setDragOffset(constrainedOffset);
    },
    [surfaceWidth],
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (event.currentTarget.hasPointerCapture(drag.pointerId)) {
        event.currentTarget.releasePointerCapture(drag.pointerId);
      }

      if (drag.moved) {
        const targetIndex = getDropIndex(drag.lastX, drag.id);
        const next = drag.startOrder.filter((id) => id !== drag.id);
        next.splice(targetIndex, 0, drag.id);
        if (!sameOrder(drag.startOrder, next)) {
          commitOrder(next, true);
        }
      }

      dragRef.current = null;
      setDraggingId(null);
      setDragOffset(0);
      setLiquidDragLeft(null);
    },
    [commitOrder, getDropIndex],
  );

  const handleTabKeyDown = useCallback(
    (id: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
      const index = orderRef.current.indexOf(id);
      if (index === -1) return;

      if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        moveBy(id, event.key === "ArrowLeft" ? -1 : 1);
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = (index + direction + orderRef.current.length) % orderRef.current.length;
      const nextId = orderRef.current[nextIndex];
      setActive(nextId);
      requestAnimationFrame(() => {
        tabRefs.current[nextId]
          ?.querySelector<HTMLButtonElement>('[role="tab"]')
          ?.focus();
      });
    },
    [moveBy, setActive],
  );

  if (!orderedItems.length) return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate min-w-0 overflow-hidden rounded-[2rem] bg-[#292929] text-white",
        classNames?.root,
        className,
      )}
    >
      {liquidSurfacePath ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${surfaceWidth} ${RAIL_HEIGHT + 8}`}
          preserveAspectRatio="none"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-full text-[#fafaf8]",
            classNames?.activeTab,
          )}
        >
          <motion.path
            initial={false}
            animate={{ d: liquidSurfacePath }}
            transition={
              reduce || draggingId ? { duration: 0 } : SPRING_LAYOUT
            }
            fill="currentColor"
          />
        </svg>
      ) : null}
      <div className="relative h-20">
        <div
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          className={cn(
            "relative z-10 flex h-full min-w-0 items-end gap-3 px-4 pt-3 md:gap-4",
            classNames?.rail,
          )}
        >
          {orderedItems.map((item) => {
            const isActive = item.id === activeId;
            const isDragging = item.id === draggingId;
            const tabId = `${uid}-tab-${safeId(item.id)}`;

            return (
              <motion.div
                key={item.id}
                ref={(node) => {
                  tabRefs.current[item.id] = node;
                }}
                layout={reduce ? false : "position"}
                transition={
                  reduce || isDragging ? { duration: 0 } : SPRING_LAYOUT
                }
                animate={
                  reduce
                    ? {
                        opacity: item.disabled
                          ? 0.4
                          : draggingId && !isDragging
                            ? 0.72
                            : 1,
                      }
                    : {
                        x: isDragging ? dragOffset : 0,
                        opacity: item.disabled
                          ? 0.4
                          : draggingId && !isDragging
                            ? 0.72
                            : 1,
                      }
                }
                style={{
                  zIndex: isDragging ? 30 : isActive ? 20 : 1,
                }}
                className={cn(
                  "group relative flex h-14 w-44 shrink-0 select-none touch-pan-y items-stretch",
                  item.disabled && "cursor-not-allowed",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
                onPointerDown={(event) => startDrag(item.id, event)}
                onPointerMove={moveDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
              >
                {!isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-2 top-0 rounded-[1.25rem] bg-transparent transition-colors duration-200 group-hover:bg-white/[0.06]"
                  />
                ) : null}

                <button
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${uid}-panel`}
                  aria-disabled={item.disabled || undefined}
                  tabIndex={isActive ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => setActive(item.id)}
                  onKeyDown={(event) => handleTabKeyDown(item.id, event)}
                  className={cn(
                    "group relative z-10 flex h-full w-full min-w-0 items-center gap-2 overflow-hidden rounded-t-[inherit] px-3 text-left outline-none transition-colors",
                    isActive
                      ? "text-[#181818]"
                      : "pb-2 text-white/70 hover:text-white",
                    classNames?.tab,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-1 top-1 opacity-0 transition-opacity group-focus-visible:opacity-100",
                      isActive
                        ? "bottom-0 rounded-t-[1.25rem] border-x-2 border-t-2 border-black/20"
                        : "bottom-2 rounded-[1rem] border-2 border-white/60",
                    )}
                  />
                  {item.icon ? (
                    <span
                      aria-hidden
                      className={cn("grid size-8 shrink-0 place-items-center", classNames?.icon)}
                    >
                      {item.icon}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "min-w-0 truncate whitespace-nowrap text-base font-medium leading-none tracking-[-0.025em]",
                      classNames?.label,
                    )}
                  >
                    {item.label}
                  </span>
                </button>

                {onClose ? (
                  <button
                    type="button"
                    aria-label={`Close ${item.label}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onClose(item.id);
                    }}
                    className={cn(
                      "absolute right-2 top-1/2 z-20 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#9aa0a8] transition-colors hover:bg-black/[0.06] hover:text-[#4b5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
                      !isActive && "top-[calc(50%-4px)] text-white/45 hover:bg-white/[0.08] hover:text-white/80",
                      classNames?.close,
                    )}
                  >
                    <X aria-hidden className="size-3.5 stroke-[1.5]" />
                  </button>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${safeId(activeId ?? "empty")}`}
        className={cn(
          "relative z-20 mx-4 min-h-64 overflow-hidden rounded-b-[1.75rem] bg-[#fafaf8] text-[#181818]",
          classNames?.content,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.08, ease: EASE_OUT } }
                  : {
                      opacity: 0,
                      y: -5,
                      filter: "blur(5px)",
                      transition: { duration: 0.12, ease: EASE_OUT },
                    }
              }
              transition={reduce ? { duration: 0.12, ease: EASE_OUT } : SPRING_PRESS}
              className="min-h-64"
            >
              {activeItem.content}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
