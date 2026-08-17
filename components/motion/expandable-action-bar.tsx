"use client";

import { LayoutGroup, motion, type Transition, useReducedMotion } from "motion/react";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverGesture } from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { cn } from "@/lib/utils";

export type ExpandableActionBarSize = "sm" | "md";

export type ExpandableActionBarItem = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: ReactNode;
  shortcut?: ReactNode;
};

export type ExpandableActionBarClassNames = {
  root?: string;
  track?: string;
  item?: string;
  activeItem?: string;
  icon?: string;
  label?: string;
  badge?: string;
  shortcut?: string;
};

export interface ExpandableActionBarProps {
  items: ExpandableActionBarItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  activeId?: string;
  onAction?: (item: ExpandableActionBarItem) => void;
  size?: ExpandableActionBarSize;
  /**
   * Expand when a pointer that hovers rests on the bar. Default true. It also
   * governs the touch equivalent: with no hover to reveal the labels, the
   * first tap expands the bar and runs no action, and the second one acts.
   * Set false to make every tap and click act immediately.
   */
  expandOnHover?: boolean;
  expandOnFocus?: boolean;
  collapseDelay?: number;
  className?: string;
  classNames?: ExpandableActionBarClassNames;
  renderItem?: (item: ExpandableActionBarItem, state: { expanded: boolean; active: boolean }) => ReactNode;
}

const ITEM_TRANSITION: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 34,
  mass: 0.62,
};

const LABEL_TRANSITION: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

const SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "min-h-9 gap-1 p-1 text-xs",
  md: "min-h-11 gap-1.5 p-1.5 text-sm",
};

const ITEM_SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "h-7 min-w-7 px-1.5",
  md: "h-8 min-w-8 px-2",
};

const ICON_SIZE_CLASS: Record<ExpandableActionBarSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? false);
  const isControlled = expanded !== undefined;
  const value = expanded ?? internalExpanded;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  return [value, setValue] as const;
}

export function ExpandableActionBar({
  items,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  activeId,
  onAction,
  size = "md",
  expandOnHover = true,
  expandOnFocus = true,
  collapseDelay = 90,
  className,
  classNames,
  renderItem,
}: ExpandableActionBarProps) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Set by the tap that expands the bar, and the reason the outside-tap
  // dismisser exists at all — a hovering pointer has its own way out.
  const [tapExpanded, setTapExpanded] = useState(false);
  const collapseTimer = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  // What the last gesture on an action was, and whether the bar was already
  // expanded when it started. A click reports neither.
  const tap = useTapGesture<boolean>();
  const hover = useHoverGesture();

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    collapseTimer.current = null;
  }, []);

  const open = useCallback(() => {
    clearCollapseTimer();
    setIsExpanded(true);
  }, [clearCollapseTimer, setIsExpanded]);

  const close = useCallback(() => {
    clearCollapseTimer();
    const timer = window.setTimeout(() => {
      setIsExpanded(false);
      setHoveredId(null);
      setTapExpanded(false);
    }, collapseDelay);
    collapseTimer.current = timer;
  }, [clearCollapseTimer, collapseDelay, setIsExpanded]);

  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

  // A collapse from outside takes the labels with it, so the arm the tap that
  // expanded the bar left behind has to go too — otherwise the next tap runs
  // an action whose label nobody can read. Only on the way down from expanded:
  // a controlled bar that declined to expand at all keeps its arm, which is
  // what lets its second tap act.
  const wasExpanded = useRef(isExpanded);
  useEffect(() => {
    if (wasExpanded.current && !isExpanded) setTapExpanded(false);
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  // A finger never hovers and Safari does not focus a button on tap, so a bar a
  // tap expanded would have nothing to close it. The tap that lands elsewhere
  // stands in for the pointer leaving — and it is consumed rather than passed
  // through, because the labelled bar is exactly the kind of surface people
  // dismiss by tapping just past it, over whatever control is there.
  useDismiss(tapExpanded && isExpanded, close, trackRef, {
    behavior: "consume",
  });

  const onRootPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    // The gesture is told about every enter, `expandOnHover` or not: it is
    // what the matching leave is read against.
    if (hover.enter(event) && expandOnHover) open();
  };

  const onRootPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (!hover.leave(event)) return;
    setHoveredId(null);
    if (expandOnHover) close();
  };

  const onRootFocus = () => {
    if (expandOnFocus) open();
  };

  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node) && expandOnFocus) {
      close();
    }
  };

  const activeItemId = activeId ?? items.find((item) => item.active)?.id;
  const highlightId = hoveredId ?? activeItemId;

  return (
    <LayoutGroup id={layoutId}>
      <motion.div
        layout="size"
        // Pointer events, not the mouse pair: a tap fires compatibility
        // mouseenter/mouseleave that carry no pointerType, and the bar growing
        // under a stationary finger fired the leave before the click ever
        // landed — so one tap expanded, collapsed and ran nothing.
        onPointerEnter={onRootPointerEnter}
        onPointerLeave={onRootPointerLeave}
        onFocus={onRootFocus}
        onBlur={onRootBlur}
        transition={ITEM_TRANSITION}
        className={cn("inline-flex max-w-full", classNames?.root, className)}
      >
        <motion.div
          ref={trackRef}
          layout="size"
          className={cn(
            // Labelled actions can outgrow the space the bar sits in — the pill
            // stays inside it and scrolls its rail rather than running off the
            // edge, where the last action is unreachable.
            "scrollbar-hide relative inline-flex max-w-full items-center overflow-x-auto overflow-y-hidden rounded-full border border-border bg-card/90 shadow-2xl backdrop-blur-xl",
            SIZE_CLASS[size],
            classNames?.track,
          )}
          transition={ITEM_TRANSITION}
        >
          {items.map((item) => {
            const isActive = item.active || activeId === item.id;
            const isHighlighted = highlightId === item.id;

            return (
              <motion.button
                key={item.id}
                layout="position"
                type="button"
                disabled={item.disabled}
                title={typeof item.label === "string" ? item.label : undefined}
                onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
                  if (!hover.enter(event)) return;
                  clearCollapseTimer();
                  setHoveredId(item.id);
                }}
                onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                  tap.start(event, isExpanded);
                }}
                // A gesture the platform takes away sends no click, and a key
                // press starts an activation that never had a pointer behind
                // it: either one would otherwise leave the finger in place for
                // the next click to spend.
                onPointerCancel={tap.drop}
                onKeyDown={tap.drop}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.blur();
                  const gesture = tap.take();
                  // Nothing reveals the labels to a finger, so the first tap
                  // expands the bar and the next one runs the action. The bar
                  // state is read from the gesture's start: a browser that
                  // focuses the button on contact expands it mid-tap, and that
                  // first tap would otherwise fire the action it was meant to
                  // reveal. `tapExpanded` arms the second tap, so a controlled
                  // bar that declines to expand still runs the action rather
                  // than swallowing every tap.
                  const firstTap =
                    gesture !== null &&
                    gesture.pointerType !== "mouse" &&
                    !gesture.state &&
                    !tapExpanded;
                  if (firstTap && expandOnHover) {
                    setTapExpanded(true);
                    open();
                    setHoveredId(item.id);
                    return;
                  }
                  item.onClick?.();
                  onAction?.(item);
                }}
                whileTap={reduce || item.disabled ? undefined : { scale: 0.96 }}
                transition={ITEM_TRANSITION}
                className={cn(
                  "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-muted-foreground outline-none transition-[color,background-color] duration-150 ease-out",
                  "focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-40",
                  isHighlighted && "text-foreground",
                  ITEM_SIZE_CLASS[size],
                  classNames?.item,
                  isActive && classNames?.activeItem,
                )}
              >
                {isHighlighted ? (
                  <motion.span
                    layoutId="action-bar-highlight"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/[0.07]"
                    transition={ITEM_TRANSITION}
                  />
                ) : null}

                {renderItem ? (
                  renderItem(item, { expanded: isExpanded, active: isActive })
                ) : (
                  <>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center",
                        ICON_SIZE_CLASS[size],
                        classNames?.icon,
                      )}
                    >
                      {item.icon}
                    </span>

                    <motion.span
                      aria-hidden={!isExpanded}
                      animate={
                        reduce
                          ? {
                              width: isExpanded ? "auto" : 0,
                              opacity: isExpanded ? 1 : 0,
                              marginLeft: isExpanded ? 8 : 0,
                              x: 0,
                              filter: "blur(0px)",
                            }
                          : {
                              width: isExpanded ? "auto" : 0,
                              opacity: isExpanded ? 1 : 0,
                              x: isExpanded ? 0 : -4,
                              marginLeft: isExpanded ? 8 : 0,
                              filter: isExpanded ? "blur(0px)" : "blur(3px)",
                            }
                      }
                      transition={reduce ? { duration: 0 } : LABEL_TRANSITION}
                      className={cn(
                        "inline-block overflow-hidden whitespace-nowrap",
                        classNames?.label,
                      )}
                    >
                      {item.label}
                    </motion.span>

                    {item.shortcut ? (
                      <motion.span
                        aria-hidden={!isExpanded}
                        animate={{
                          width: isExpanded ? "auto" : 0,
                          opacity: isExpanded ? 1 : 0,
                          marginLeft: isExpanded ? 4 : 0,
                        }}
                        transition={LABEL_TRANSITION}
                        className={cn(
                          "hidden overflow-hidden whitespace-nowrap text-[10px] text-muted-foreground sm:inline-block",
                          classNames?.shortcut,
                        )}
                      >
                        {item.shortcut}
                      </motion.span>
                    ) : null}

                    {item.badge ? (
                      <span
                        className={cn(
                          "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-primary-foreground",
                          !isExpanded && "absolute right-0.5 top-0.5",
                          classNames?.badge,
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

export function useExpandableActionBar(items: ExpandableActionBarItem[]) {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items],
  );

  return useMemo(
    () => ({ expanded, setExpanded, activeId, setActiveId, activeItem }),
    [activeId, activeItem, expanded],
  );
}
