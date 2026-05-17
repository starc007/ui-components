"use client";

import { motion } from "motion/react";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  layoutId: string;
  variant: "pill" | "underline" | "segment";
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  variant = "pill",
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  variant?: "pill" | "underline" | "segment";
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const layoutId = useId();
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setValue = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, layoutId, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const listVariants = {
  pill:
    "inline-flex items-center gap-1 rounded-xl p-1 glass-thin",
  underline:
    "inline-flex items-center gap-1 border-b border-(--color-border)",
  segment:
    "inline-flex items-center gap-0 rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-0.5",
} as const;

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const { variant } = useTabsContext();
  return (
    <div role="tablist" className={cn(listVariants[variant], className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: current, setValue, layoutId, variant } = useTabsContext();
  const active = current === value;

  if (variant === "underline") {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setValue(value)}
        className={cn(
          "relative -mb-px px-3 pb-2.5 pt-1 text-sm font-medium transition-colors press",
          active ? "text-(--color-fg)" : "text-(--color-fg-muted) hover:text-(--color-fg)",
          className,
        )}
      >
        {children}
        {active ? (
          <motion.span
            layoutId={layoutId}
            className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-(--color-accent)"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => setValue(value)}
      className={cn(
        "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors press",
        active ? "text-(--color-fg)" : "text-(--color-fg-muted) hover:text-(--color-fg)",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          className={cn(
            "absolute inset-0 -z-10 rounded-lg",
            variant === "segment"
              ? "bg-(--color-bg) shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,0_4px_12px_-4px_rgb(0_0_0/0.25)]"
              : "bg-(--color-bg-elev) shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,inset_0_0_0_1px_var(--color-border)]",
          )}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: current } = useTabsContext();
  if (current !== value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}
