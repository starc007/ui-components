"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useMeasure from "react-use-measure";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ExpandableTabsItem = {
  id: string;
  label: ReactNode;
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

// Content slides in from the side it was opened toward; exits faster.
const CONTENT_VARIANTS: Variants = {
  enter: (dir: number) => ({ x: dir * 20, opacity: 0, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: dir * -20, opacity: 0, filter: "blur(4px)" }),
};

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

  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const activeId = controlled ? value : internal;
  const active = items.find((item) => item.id === activeId) ?? null;

  const setActive = (next: string | null) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  // Direction the content slides — which way the index moved. Holds the last
  // open index so reopening keeps a sensible direction.
  const prevIndex = useRef(0);
  const activeIndex = active
    ? items.findIndex((item) => item.id === active.id)
    : prevIndex.current;
  const direction = activeIndex >= prevIndex.current ? 1 : -1;
  useEffect(() => {
    if (active) prevIndex.current = activeIndex;
  }, [active, activeIndex]);

  // Outside click / Escape closes — it behaves like an open menu.
  useEffect(() => {
    if (!active) return;
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
  });

  // Measures the natural size of the content; the shell springs to it. A
  // synchronous mount measure seeds an explicit size before the first paint, so
  // a fast first click (before react-use-measure's async observer fires) still
  // animates instead of snapping open.
  const [measureRef, bounds] = useMeasure();
  const seedRef = useRef<HTMLDivElement | null>(null);
  const [seed, setSeed] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    if (seedRef.current) {
      setSeed({ width: seedRef.current.offsetWidth, height: seedRef.current.offsetHeight });
    }
  }, []);
  const setSizeRef = (el: HTMLDivElement | null) => {
    measureRef(el);
    seedRef.current = el;
  };
  const shellWidth = bounds.width || seed?.width || 0;
  const shellHeight = bounds.height || seed?.height || 0;

  return (
    <>
      {/* Bottom-anchored: place this in a bottom-aligned parent so the card
          unfurls upward. The shell springs to the measured natural size of the
          content, so it hugs the bar when closed and grows to the panel when
          open — no dead space, no width snap. `justify-end` pins the content to
          the bottom so the bar stays put while the shell grows up. */}
      <motion.div
        ref={rootRef}
        initial={false}
        animate={shellWidth ? { width: shellWidth, height: shellHeight } : undefined}
        transition={reduce ? { duration: 0 } : SPRING_PANEL}
        className={cn(
          "relative flex flex-col justify-end overflow-hidden rounded-3xl border border-border bg-card",
          className,
          classNames?.root,
        )}
      >
        <div ref={setSizeRef} className="flex w-max flex-col p-2">
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                custom={direction}
                variants={reduce ? undefined : CONTENT_VARIANTS}
                initial={reduce ? { opacity: 0 } : "enter"}
                animate={reduce ? { opacity: 1 } : "center"}
                exit={reduce ? { opacity: 0 } : "exit"}
                transition={reduce ? { duration: 0 } : { duration: 0.26, ease: EASE_OUT }}
                className={cn("px-1 pb-2", classNames?.panel)}
              >
                {active.content}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Tab bar — active tab expands to a labelled pill, the rest stay icons. */}
          <div
            role="tablist"
            aria-orientation="horizontal"
            className={cn("flex items-center gap-1", classNames?.bar)}
          >
            {items.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(isActive ? null : item.id)}
                  className={cn(
                    "relative isolate flex h-10 shrink-0 items-center rounded-2xl px-3 text-sm font-medium outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    classNames?.tab,
                    isActive && classNames?.activeTab,
                  )}
                >
                  {/* No layoutId — the pill appears at the clicked tab and grows
                      in place with the button (no glide from the previous tab). */}
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.span
                        key="pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.15, ease: EASE_OUT }}
                        className={cn(
                          "absolute inset-0 -z-10 rounded-2xl bg-foreground/10",
                          classNames?.pill,
                        )}
                      />
                    ) : null}
                  </AnimatePresence>
                  <span className={cn("grid shrink-0 place-items-center", classNames?.icon)}>
                    {item.icon}
                  </span>
                  {/* Width animates so the button — and the pill filling it — grow
                      smoothly as the label appears, instead of snapping. */}
                  <motion.span
                    aria-hidden={!isActive}
                    initial={false}
                    animate={
                      reduce
                        ? { width: isActive ? "auto" : 0, opacity: isActive ? 1 : 0, marginLeft: isActive ? 8 : 0 }
                        : {
                            width: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                            marginLeft: isActive ? 8 : 0,
                            filter: isActive ? "blur(0px)" : "blur(3px)",
                          }
                    }
                    // Expand on a spring; collapse fast so the previous tab
                    // doesn't linger ("left behind") as a new one opens.
                    transition={
                      reduce
                        ? { duration: 0 }
                        : isActive
                          ? SPRING_LAYOUT
                          : { duration: 0.13, ease: EASE_OUT }
                    }
                    className={cn(
                      "inline-block overflow-hidden whitespace-nowrap",
                      classNames?.label,
                    )}
                  >
                    {item.label}
                  </motion.span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}
