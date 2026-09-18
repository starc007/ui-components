"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, MotionConfig, useReducedMotion, type Transition } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Variant = "pill" | "underline" | "segment";

type Ctx = {
  value: string;
  setValue: (v: string) => void;
  layoutId: string;
  variant: Variant;
};

const TabsCtx = createContext<Ctx | null>(null);

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

// Settle without overshoot: a scrollable tab list would turn even a small
// overshoot into a transient scrollbar and layout shift.
const transition: Transition = {
  type: "spring",
  stiffness: 170,
  damping: 30,
  mass: 1.2,
};

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "pill",
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const layoutId = useId();
  const reduce = useReducedMotion();
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = useCallback(
    (v: string) => {
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange],
  );
  const contextValue = useMemo(
    () => ({ value: current, setValue, layoutId, variant }),
    [current, layoutId, setValue, variant],
  );
  return (
    <MotionConfig transition={reduce ? { duration: 0 } : transition}>
      <TabsCtx.Provider value={contextValue}>
        {/* layoutRoot: the indicator's layoutId measures in page coordinates, so
            inside fixed/scrolled containers it would replay scroll offsets as
            movement. The pill only ever travels within the list, so scoping
            projection to the Tabs wrapper is always correct. */}
        <motion.div layoutRoot className={className}>
          {children}
        </motion.div>
      </TabsCtx.Provider>
    </MotionConfig>
  );
}

const listClasses: Record<Variant, string> = {
  pill: "inline-flex items-center gap-1 rounded-full bg-card p-1",
  underline: "inline-flex items-center gap-1 border-b border-border",
  segment: "inline-flex items-center gap-0 rounded-lg bg-card p-0.5",
};

export function TabsList({
  children,
  className,
  wrapperClassName,
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  const { variant, value } = useTabs();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  const measure = useCallback(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;
    // Overlay controls do not reduce the viewport or change its scroll range.
    const overflow = viewport.scrollWidth > root.clientWidth + 1;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const rtl = getComputedStyle(viewport).direction === "rtl";
    // Modern browsers expose negative scrollLeft in RTL. Clamp rubber-banding.
    const fromLeft = Math.max(0, Math.min(max, rtl ? max + viewport.scrollLeft : viewport.scrollLeft));
    const next = { overflow, left: fromLeft > 1, right: fromLeft < max - 1 };
    setEdges((previous) => previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next);
  }, []);

  const reveal = useCallback((tab: HTMLElement | null) => {
    const viewport = viewportRef.current;
    if (!viewport || !tab) return;
    const frame = viewport.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const rtl = getComputedStyle(viewport).direction === "rtl";
    const fromLeft = Math.max(0, Math.min(max, rtl ? max + viewport.scrollLeft : viewport.scrollLeft));
    // Keep the selected/focused label clear of the arrows over the faded edges.
    const left = frame.left + (fromLeft > 1 ? 36 : 0);
    const right = frame.right - (fromLeft < max - 1 ? 36 : 0);
    const delta = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
    // Scroll only this viewport; scrollIntoView can also move the whole page.
    if (delta) viewport.scrollBy({ left: delta, behavior: reduce ? "instant" : "smooth" });
  }, [reduce]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!root || !viewport || !list) return;
    const update = () => {
      measure();
      reveal(list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'));
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(viewport);
    observer.observe(list);
    viewport.addEventListener("scroll", measure, { passive: true });
    update();
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", measure);
    };
  }, [measure, reveal]);

  useLayoutEffect(() => {
    // Children may change without a resize; controlled selection must also reveal.
    void children;
    void value;
    void edges.overflow;
    measure();
    reveal(listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? null);
  }, [children, value, edges.overflow, measure, reveal]);

  const scroll = (direction: number) => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollBy({ left: direction * viewport.clientWidth * 0.8, behavior: reduce ? "instant" : "smooth" });
  };
  const controlClass = "absolute inset-y-0 z-20 inline-flex w-9 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-0";
  const surfaceClass = variant === "pill" ? "rounded-full bg-card" : variant === "segment" ? "rounded-lg bg-card" : "";

  return (
    <div ref={rootRef} className={cn("relative isolate flex w-full max-w-full min-w-0 items-center", edges.overflow && surfaceClass, wrapperClassName)}>
      {edges.overflow && (
        <button type="button" aria-label="Scroll tabs left" aria-controls={viewportId} disabled={!edges.left} onClick={() => scroll(-1)} className={cn(controlClass, "left-0 rounded-l-full")}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}
      <motion.div
        ref={viewportRef}
        id={viewportId}
        layoutScroll
        className={cn("w-full min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", edges.overflow && "[border-radius:inherit]")}
        style={edges.overflow ? {
          maskImage: `linear-gradient(to right, ${edges.left ? "transparent, black 40px" : "black, black 0px"}, ${edges.right ? "black calc(100% - 40px), transparent" : "black 100%"})`,
        } : undefined}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab") reveal(event.target);
        }}
      >
        <div ref={listRef} role="tablist" className={cn(listClasses[variant], "w-max", className)}>
          {children}
        </div>
      </motion.div>
      {edges.overflow && edges.left && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 rounded-l-[inherit] backdrop-blur-[2px] [mask-image:linear-gradient(to_right,black,transparent)]" />
      )}
      {edges.overflow && edges.right && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 rounded-r-[inherit] backdrop-blur-[2px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      )}
      {edges.overflow && (
        <button type="button" aria-label="Scroll tabs right" aria-controls={viewportId} disabled={!edges.right} onClick={() => scroll(1)} className={cn(controlClass, "right-0 rounded-r-full")}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  indicatorClassName,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  indicatorClassName?: string;
}) {
  const { value: current, setValue, layoutId, variant } = useTabs();
  const active = current === value;

  if (variant === "underline") {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setValue(value)}
        className={cn(
          "relative isolate px-3 pb-2.5 pt-1 -mb-px text-sm font-medium transition-colors min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        {children}
        {active ? (
        <motion.span
          layoutId={layoutId}
          layout="position"
          className={cn(
            "absolute -bottom-px left-0 right-0 h-px bg-primary",
            indicatorClassName,
          )}
        />
        ) : null}
      </button>
    );
  }

  const radius = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <div className="relative shrink-0">
      {active ? (
        <motion.span
          layoutId={layoutId}
          layout="position"
          style={{ borderRadius: variant === "pill" ? 9999 : 8 }}
          className={cn(
            "absolute inset-0 bg-primary",
            radius,
            indicatorClassName,
          )}
        />
      ) : null}
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setValue(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap bg-transparent px-3.5 py-1.5 text-sm font-medium outline-none",
          "transition-colors",
          active
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
          radius,
          className,
        )}
      >
        {children}
      </button>
    </div>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: current } = useTabs();
  const reduce = useReducedMotion();
  const active = current === value;
  // Inactive panels stay mounted but hidden, so their content (e.g. source
  // code) is present in the server-rendered HTML for crawlers and assistive
  // tech, instead of being dropped from the DOM.
  if (!active) {
    return (
      <div hidden className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: reduce ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}
