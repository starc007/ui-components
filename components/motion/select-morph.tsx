"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface MorphSelectOption {
  label: string;
  value: string;
}

// Shared-layout morph: trigger box grows into the panel and back, one surface.
const MORPH: Transition = { type: "spring", duration: 0.5, bounce: 0.22 };
// Trigger and panel header share this row so the morph stays seamless.
const ROW = "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm";

const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export interface MorphSelectProps {
  options: MorphSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Select whose trigger morphs into the panel via a shared layoutId — instead of
 * a separate dropdown opening, the trigger itself grows into the menu and
 * shrinks back, never detaching. (See `Select` for the gooey, pinch-off feel.)
 */
export function MorphSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select",
  disabled = false,
  className,
}: MorphSelectProps) {
  const reduce = useReducedMotion() ?? false;
  const layoutId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const selected = options.find((o) => o.value === current);

  const select = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* invisible sizer reserves the closed height — the morph surface is
          absolute, so this keeps surrounding layout from shifting */}
      <div
        aria-hidden
        className={cn(ROW, "invisible rounded-xl border border-border")}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown className="h-4 w-4" />
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId={layoutId}
            role="listbox"
            transition={reduce ? { duration: 0 } : MORPH}
            style={{ borderRadius: 12 }}
            className="absolute inset-x-0 top-0 z-30 overflow-hidden border border-border bg-background shadow-lg"
          >
            {/* header mirrors the trigger so the box morph reads as continuous */}
            <motion.div layout="position" className={cn(ROW, "text-foreground")}>
              <span
                className={selected ? "text-foreground" : "text-muted-foreground"}
              >
                {selected?.label ?? placeholder}
              </span>
              <motion.span
                animate={{ rotate: 180 }}
                transition={reduce ? { duration: 0 } : MORPH}
                className="text-muted-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </motion.div>

            <div className="h-px bg-border" />

            <motion.ul
              initial="hidden"
              animate="show"
              variants={reduce ? undefined : LIST}
              className="p-1"
            >
              {options.map((o) => {
                const isSel = o.value === current;
                return (
                  <motion.li key={o.value} variants={reduce ? undefined : ITEM}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      onClick={() => select(o.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none transition-colors",
                        isSel
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted",
                      )}
                    >
                      {o.label}
                      {isSel ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        ) : (
          <motion.button
            key="trigger"
            layoutId={layoutId}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            transition={reduce ? { duration: 0 } : MORPH}
            style={{ borderRadius: 12 }}
            className={cn(
              ROW,
              "absolute inset-x-0 top-0 z-10 border border-border bg-background text-foreground outline-none transition-colors",
              "hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-foreground/20",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <motion.span
              layout="position"
              className={selected ? "text-foreground" : "text-muted-foreground"}
            >
              {selected?.label ?? placeholder}
            </motion.span>
            <motion.span layout="position" className="text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
