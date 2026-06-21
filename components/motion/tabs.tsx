"use client";

import { motion, MotionConfig, useReducedMotion, type Transition } from "motion/react";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
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

// Weighty spring — borrowed from dimi.me/lab/animated-tabs.
const transition: Transition = {
  type: "spring",
  stiffness: 170,
  damping: 24,
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
  const setValue = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <MotionConfig transition={reduce ? { duration: 0 } : transition}>
      <TabsCtx.Provider value={{ value: current, setValue, layoutId, variant }}>
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

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const { variant } = useTabs();
  return (
    <div role="tablist" className={cn(listClasses[variant], className)}>
      {children}
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
          "relative isolate px-3 pb-2.5 pt-1 -mb-px text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        {children}
        {active ? (
        <motion.span
          layoutId={layoutId}
          className={cn(
            "absolute -bottom-px left-0 right-0 h-px bg-primary",
            indicatorClassName,
          )}
        />
        ) : null}
      </button>
    );
  }

  // Pill + Segment use the same trick: a max-contrast pill slides via layoutId,
  // text uses `mix-blend-exclusion` so it inverts dynamically against the moving bg.
  const radius = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <div className="relative">
      {active ? (
        <motion.span
          layoutId={layoutId}
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
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap bg-transparent px-3.5 py-1.5 text-sm font-medium transition-colors outline-none",
          active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
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
