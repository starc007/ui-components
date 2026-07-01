"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type TableMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

const MENU_WIDTH = 188;

export function TableMenu({
  items,
  ariaLabel,
  trigger,
  triggerClassName,
}: {
  items: TableMenuItem[];
  ariaLabel: string;
  trigger: ReactNode;
  triggerClassName?: string;
}) {
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const open = coords !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setCoords(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Close on any scroll (the trigger moves) or resize; fixed coords go stale.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setCoords(null);
      return;
    }
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 4,
      left: Math.max(8, r.right - MENU_WIDTH),
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-40"
                onPointerDown={() => setCoords(null)}
              />
              <motion.div
                role="menu"
                className="fixed z-50 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl"
                style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
                initial={
                  reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }
                }
                animate={
                  reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
                }
                transition={reduce ? { duration: 0 } : SPRING_PANEL}
              >
                {items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCoords(null);
                      item.onSelect();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors [&_svg]:h-4 [&_svg]:w-4",
                      item.destructive
                        ? "text-rose-500 hover:bg-rose-500/10"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
