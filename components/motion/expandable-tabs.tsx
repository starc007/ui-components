"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ExpandableTabsItem = {
  id: string;
  /** String label — shown inside the active tab and used as the button's accessible name. */
  label: string;
  icon: ReactNode;
  /** Panel shown above the bar when this tab is active. */
  content: ReactNode;
};

export type ExpandableTabsClassNames = {
  root?: string;
  panel?: string;
  bar?: string;
  tab?: string;
  activeTab?: string;
  icon?: string;
  label?: string;
  pill?: string;
};

export interface ExpandableTabsProps {
  items: ExpandableTabsItem[];
  /** Active tab id, or null/undefined for the closed (bar-only) state. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  className?: string;
  classNames?: ExpandableTabsClassNames;
}

type Size = { width: number; height: number };

// DynamicIsland-style real width/height motion, tuned tighter here so the tab
// bar feels controlled instead of elastic.
const SHELL_SPRING = { type: "spring", duration: 0.58, bounce: 0.06 } as const;

// Position-only tab layout motion keeps switching loose without stretching
// icons or letting the label linger.
const TAB_CHANGE_SPRING = {
  type: "spring",
  duration: 0.46,
  bounce: 0.04,
} as const;
const LABEL_OPEN = { type: "spring", duration: 0.38, bounce: 0.03 } as const;
const LABEL_CLOSE = { duration: 0.16, ease: EASE_OUT } as const;

// Fixed bar height keeps the content panel's bottom reserve static so the open
// height is right on the first frame. p-2 (16) + h-9 button (36).
const BAR_H = 52;
const TAB_W = 32;
const BAR_X = 16;
const BAR_GAP = 4;
const ROOT_BORDER = 2;
const ICON_W = 16;
const ACTIVE_LEFT_PAD = 10;
const ACTIVE_RIGHT_PAD = 16;
const LABEL_GAP = 7;
const PANEL_DOCK_GAP = 4;

// Content is clipped above the dock so rows never pass through the icon bar.
// It enters from slightly above instead of from the dock line.
const CONTENT_VARIANTS: Variants = {
  enter: { y: -8, scale: 0.98, opacity: 0, filter: "blur(4px)" },
  center: { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" },
  exit: {
    y: -6,
    scale: 0.98,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.08, ease: EASE_OUT },
  },
};

const REDUCED_CONTENT_VARIANTS: Variants = {
  enter: { opacity: 0, filter: "blur(0px)" },
  center: { opacity: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    filter: "blur(0px)",
    transition: { duration: 0.08, ease: EASE_OUT },
  },
};

const CONTENT_SPRING = { type: "spring", duration: 0.46, bounce: 0.08 } as const;

function sameSize(a: Size | null | undefined, b: Size | null | undefined) {
  return a?.width === b?.width && a?.height === b?.height;
}

function sameWidths(a: Record<string, number>, b: Record<string, number>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
}

function useContentSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = { width: el.offsetWidth, height: el.offsetHeight };
    setSize((current) => (sameSize(current, next) ? current : next));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return [ref, size] as const;
}

function useLabelWidths(items: ExpandableTabsItem[]) {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [widths, setWidths] = useState<Record<string, number>>({});

  const setLabelMeasureRef = useCallback(
    (id: string) => (node: HTMLSpanElement | null) => {
      refs.current[id] = node;
    },
    [],
  );

  const measure = useCallback(() => {
    const next: Record<string, number> = {};

    for (const item of items) {
      const node = refs.current[item.id];

      if (node) {
        next[item.id] = Math.ceil(node.offsetWidth);
      }
    }

    setWidths((current) => (sameWidths(current, next) ? current : next));
  }, [items]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);

    for (const item of items) {
      const node = refs.current[item.id];

      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [items, measure]);

  return { setLabelMeasureRef, widths };
}

export function ExpandableTabs({
  items,
  value,
  defaultValue = null,
  onValueChange,
  className,
  classNames,
}: ExpandableTabsProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [sizerRef, size] = useContentSize();
  const { setLabelMeasureRef, widths: labelWidths } = useLabelWidths(items);

  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const activeId = controlled ? value : internal;
  const active = items.find((item) => item.id === activeId) ?? null;
  const visualActiveId = active?.id ?? null;

  const setActive = useCallback(
    (next: string | null) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  // Outside click / Escape closes — it behaves like an open menu.
  useEffect(() => {
    if (!visualActiveId) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [setActive, visualActiveId]);

  const closedSize = {
    width:
      items.length * TAB_W +
      Math.max(0, items.length - 1) * BAR_GAP +
      BAR_X +
      ROOT_BORDER,
    height: BAR_H + ROOT_BORDER,
  };
  const openSize = size
    ? {
        width: Math.max(size.width + ROOT_BORDER, closedSize.width),
        height: Math.max(size.height + ROOT_BORDER, closedSize.height),
      }
    : closedSize;
  const targetSize = active ? openSize : closedSize;

  const getActiveTabWidth = useCallback(
    (item: ExpandableTabsItem) =>
      Math.max(
        TAB_W,
        ACTIVE_LEFT_PAD +
          ICON_W +
          LABEL_GAP +
          (labelWidths[item.id] ?? 0) +
          ACTIVE_RIGHT_PAD,
      ),
    [labelWidths],
  );

  return (
    <>
      <motion.div
        ref={rootRef}
        initial={false}
        animate={
          targetSize
            ? { width: targetSize.width, height: targetSize.height }
            : undefined
        }
        transition={reduce ? { duration: 0 } : SHELL_SPRING}
        style={{ transformOrigin: "bottom center" }}
        className={cn(
          "relative overflow-hidden rounded-[26px] border border-border bg-card",
          className,
          classNames?.root,
        )}
      >
        <div
          ref={sizerRef}
          aria-hidden
          className={cn(
            "pointer-events-none invisible absolute left-0 top-0 grid w-max px-2 pt-2",
            classNames?.panel,
          )}
          style={{ paddingBottom: BAR_H + PANEL_DOCK_GAP }}
        >
          {items.map((item) => (
            <div key={item.id} className="col-start-1 row-start-1 w-max">
              {item.content}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-0 z-10 overflow-hidden px-2 pt-2",
            classNames?.panel,
          )}
          style={{ bottom: BAR_H + PANEL_DOCK_GAP }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                variants={reduce ? REDUCED_CONTENT_VARIANTS : CONTENT_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  reduce ? { duration: 0.15, ease: EASE_OUT } : CONTENT_SPRING
                }
                className="w-max"
                style={{
                  transformOrigin: "top center",
                  willChange: "transform, opacity, filter",
                }}
              >
                {active.content}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          role="tablist"
          aria-label="Navigation tabs"
          aria-orientation="horizontal"
          className={cn(
            "absolute bottom-0 left-0 z-20 flex w-full items-center justify-between gap-1 p-2",
            classNames?.bar,
          )}
          style={{ height: BAR_H }}
        >
          {items.map((item) => {
            const isActive = item.id === visualActiveId;
            const activeTabWidth = getActiveTabWidth(item);
            const labelWidth = labelWidths[item.id] ?? 0;

            return (
              <motion.button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => setActive(isActive ? null : item.id)}
                layout={reduce ? false : "position"}
                animate={{
                  width: active && isActive ? activeTabWidth : TAB_W,
                }}
                transition={reduce ? { duration: 0 } : TAB_CHANGE_SPRING}
                className={cn(
                  "relative isolate flex h-9 min-w-8 shrink-0 items-center justify-center overflow-hidden rounded-[18px] px-2 text-sm font-medium outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active && isActive && "min-w-0 justify-start pl-2.5 pr-4",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  classNames?.tab,
                  isActive && classNames?.activeTab,
                )}
              >
                {isActive ? (
                  <span
                    className={cn(
                      "absolute inset-0 -z-10 rounded-[18px] bg-foreground/10",
                      classNames?.pill,
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "grid shrink-0 place-items-center",
                    classNames?.icon,
                  )}
                >
                  {item.icon}
                </span>
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={
                    reduce
                      ? {
                          width: isActive ? labelWidth : 0,
                          opacity: isActive ? 1 : 0,
                          marginLeft: isActive ? LABEL_GAP : 0,
                          filter: "blur(0px)",
                        }
                      : {
                          width: isActive ? labelWidth : 0,
                          opacity: isActive ? 1 : 0,
                          marginLeft: isActive ? LABEL_GAP : 0,
                          filter: isActive ? "blur(0px)" : "blur(3px)",
                        }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : isActive
                        ? LABEL_OPEN
                        : LABEL_CLOSE
                  }
                  className={cn(
                    "inline-block overflow-hidden whitespace-nowrap",
                    classNames?.label,
                  )}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -z-10 flex opacity-0"
      >
        {items.map((item) => (
          <span
            className={cn(
              "whitespace-nowrap text-sm font-medium leading-none",
              classNames?.label,
            )}
            key={item.id}
            ref={setLabelMeasureRef(item.id)}
          >
            {item.label}
          </span>
        ))}
      </div>
    </>
  );
}
