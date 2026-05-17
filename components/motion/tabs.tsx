"use client";

import { motion } from "motion/react";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
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
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ value: current, setValue, layoutId, variant }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

const listClasses: Record<Variant, string> = {
  pill: "inline-flex items-center gap-1 rounded-full bg-(--color-bg-elev) p-1",
  underline: "inline-flex items-center gap-1 border-b border-(--color-border)",
  segment: "inline-flex items-center gap-0 rounded-lg bg-(--color-bg-elev) p-0.5",
};

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const { variant } = useTabs();
  return (
    <div role="tablist" className={cn(listClasses[variant], className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
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
          "relative -mb-px px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
          active ? "text-(--color-fg)" : "text-(--color-fg-muted) hover:text-(--color-fg)",
          className,
        )}
      >
        {children}
        {active ? (
          <motion.span
            layoutId={layoutId}
            className="absolute -bottom-px left-0 right-0 h-px bg-(--color-fg)"
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
          />
        ) : null}
      </button>
    );
  }

  const radius = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => setValue(value)}
      className={cn(
        "relative isolate px-3.5 py-1.5 text-sm font-medium transition-colors",
        radius,
        active ? "text-(--color-fg)" : "text-(--color-fg-muted) hover:text-(--color-fg)",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          className={cn(
            "absolute inset-0 z-0 bg-(--color-bg) shadow-[0_1px_2px_0_rgb(0_0_0/0.06),inset_0_1px_0_0_rgb(255_255_255/0.05)]",
            radius,
          )}
          transition={{ type: "spring", stiffness: 460, damping: 36 }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: current } = useTabs();
  if (current !== value) return null;
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}
