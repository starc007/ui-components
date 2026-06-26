"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Calendar,
  Files,
  Flag,
  FolderClosed,
  NotebookPen,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { type ComponentType, useEffect, useId, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type MenuItem = { label: string; icon: ComponentType<{ className?: string }> };

const ITEMS: MenuItem[] = [
  { label: "Project", icon: FolderClosed },
  { label: "Notebook", icon: NotebookPen },
  { label: "Notes", icon: Files },
  { label: "Goal", icon: Trophy },
  { label: "Milestone", icon: Flag },
  { label: "Event", icon: Calendar },
];

// Bouncy folder-open feel: low damping so the panel overshoots as it expands.
const SPRING_FOLDER = {
  type: "spring",
  stiffness: 320,
  damping: 24,
  mass: 0.9,
} as const;

export interface CreateMenuProps {
  items?: MenuItem[];
  onSelect?: (label: string) => void;
  className?: string;
}

export function CreateMenu({
  items = ITEMS,
  onSelect,
  className,
}: CreateMenuProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const layoutId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const morph = reduce ? { duration: 0.15 } : SPRING_FOLDER;

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      {/* spacer fixes the anchor to the trigger size */}
      <div className="h-12 w-44" aria-hidden />

      {/* Centering box sized to the OPEN panel and centered on the trigger.
          place-items-center only centers an item that fits its cell, so the cell
          must be as wide as the panel — otherwise the overflow left-anchors and
          the panel expands rightward. The box is a fixed size per viewport (vw
          doesn't change mid-animation), so its -translate centering never drifts
          the way a content-sized wrapper would. Both states share its center, so
          the morph grows from the middle outward in every direction. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 grid h-[360px] w-[min(86vw,520px)] -translate-x-1/2 -translate-y-1/2 place-items-center [&>*]:pointer-events-auto">
        {/* popLayout pulls the exiting trigger out of grid flow at once, so the
            grid never briefly holds two rows and shoves the panel off-center */}
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 18 }}
              className="w-[min(86vw,520px)] overflow-hidden border border-border bg-card"
            >
              <motion.div
                // `layout` lets framer undo the box's morph scaling so this
                // content stays crisp instead of stretching with the resize.
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.12, duration: 0.2 }}
              >
                {/* header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Create new
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* grid */}
                <motion.div
                  initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  transition={{
                    delay: reduce ? 0 : 0.1,
                    duration: 0.4,
                    ease: EASE_OUT,
                  }}
                  className="grid grid-cols-3"
                >
                  {items.map((item, i) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        onSelect?.(item.label);
                        setOpen(false);
                      }}
                      // Static cell with hairline borders (no animated fill) so
                      // the grid lines never flicker as items stagger in. Only the
                      // inner content animates.
                      className={cn(
                        "flex items-center justify-center px-4 py-8 text-muted-foreground transition-colors hover:text-foreground",
                        i % 3 !== 2 && "border-r border-border",
                        i < 3 && "border-b border-border",
                      )}
                    >
                      <motion.span
                        initial={
                          reduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.85, filter: "blur(6px)" }
                        }
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{
                          delay: reduce ? 0 : 0.14 + i * 0.04,
                          type: "spring",
                          stiffness: 460,
                          damping: 30,
                        }}
                        className="flex flex-col items-center gap-3"
                      >
                        <item.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </motion.span>
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 18 }}
              onClick={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex h-12 w-44 items-center justify-center border border-border bg-card text-sm font-medium text-foreground"
            >
              {/* own `layout` counter-scales the label so it stays crisp while the
                  button box morphs, instead of stretching with it */}
              <motion.span
                layout
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                Create new
                <Plus className="h-4 w-4" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
