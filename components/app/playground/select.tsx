"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Morphing, gooey dropdown — the panel oozes out of the trigger with a springy
 * scale-from-top and a blur that resolves as it settles, items melting in on a
 * stagger. Replaces the flat native <select> in the playground.
 */
export function PlaygroundSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-(--color-border-strong)"
      >
        <span>{current?.label ?? "Select"}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            // listbox itself ignores user content; options carry the semantics
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scaleY: 0.5, y: -8, filter: "blur(10px)" }
            }
            animate={{ opacity: 1, scaleY: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scaleY: 0.7, y: -6, filter: "blur(8px)" }
            }
            transition={reduce ? { duration: 0.12 } : SPRING_PANEL}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <motion.li
                  key={o.value}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: -6, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={
                    reduce
                      ? { duration: 0.1 }
                      : { delay: 0.03 + i * 0.03, ...SPRING_PANEL }
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                      selected
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {o.label}
                    {selected ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
