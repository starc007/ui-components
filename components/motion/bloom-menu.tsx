"use client";

import {
  Bell,
  FileText,
  FolderClosed,
  LayoutGrid,
  Link,
  Plus,
  Table,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentType,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { useOnOpen } from "@/lib/hooks/use-on-open";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { cn } from "@/lib/utils";

type MenuItem = { label: string; icon: ComponentType<{ className?: string }> };

const ITEMS: MenuItem[] = [
  { label: "Doc", icon: FileText },
  { label: "Board", icon: LayoutGrid },
  { label: "Table", icon: Table },
  { label: "Folder", icon: FolderClosed },
  { label: "Reminder", icon: Bell },
  { label: "Link", icon: Link },
];

// Folder-open feel: a touch of overshoot as the panel expands, kept subtle.
const SPRING_FOLDER = {
  type: "spring",
  stiffness: 300,
  damping: 32,
  mass: 0.9,
} as const;

export interface BloomMenuProps {
  items?: MenuItem[];
  onSelect?: (label: string) => void;
  className?: string;
}

export function BloomMenu({
  items = ITEMS,
  onSelect,
  className,
}: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const layoutId = useId();
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  // Set when the menu closes holding focus: the trigger is unmounted while
  // open, so focus can only go back once it has mounted again.
  const restoreFocus = useRef(false);

  // The roving tab stop, resolved during render. Opening starts on the first
  // item; arrow keys walk the grid from there.
  const rows = useMemo(
    () => items.map((item) => ({ id: item.label })),
    [items],
  );
  const { activeIndex, moveTo } = useRowCursor(rows, "");
  useOnOpen(open, () => moveTo(null));
  const activeId = rows[activeIndex]?.id;

  const close = useCallback((returnFocus: boolean) => {
    if (returnFocus && ref.current?.contains(document.activeElement))
      restoreFocus.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      if (activeId !== undefined)
        itemRefs.current.get(activeId)?.focus({ preventScroll: true });
      return;
    }
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open, activeId]);

  const COLS = 3;
  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = rows.length - 1;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: COLS,
      ArrowUp: -COLS,
    };
    let next: number | null = null;
    if (event.key in step) {
      const target = activeIndex + step[event.key];
      next = target < 0 || target > last ? activeIndex : target;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    moveTo(rows[next].id);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
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
  }, [open, close]);

  const morph = reduce ? { duration: 0.15 } : SPRING_FOLDER;

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      {/* spacer fixes the anchor to the trigger size */}
      <div className="h-11 w-36" aria-hidden />

      {/* Centering box sized to the OPEN panel and centered on the trigger.
          place-items-center only centers an item that fits its cell, so the cell
          must be as wide as the panel — otherwise the overflow left-anchors and
          the panel expands rightward. The box is a fixed size per viewport (vw
          doesn't change mid-animation), so its -translate centering never drifts
          the way a content-sized wrapper would. Both states share its center, so
          the morph grows from the middle outward in every direction. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 grid h-[300px] w-[min(86vw,420px)] -translate-x-1/2 -translate-y-1/2 place-items-center [&>*]:pointer-events-auto">
        {/* popLayout pulls the exiting trigger out of grid flow at once, so the
            grid never briefly holds two rows and shoves the panel off-center */}
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              layoutId={layoutId}
              transition={morph}
              // Focus leaving the open menu closes it, as a click outside does.
              onBlur={(event) => {
                const next = event.relatedTarget;
                if (next instanceof Node && !ref.current?.contains(next))
                  close(false);
              }}
              style={{ borderRadius: 16 }}
              className="w-[min(86vw,420px)] overflow-hidden border border-border bg-card"
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
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span
                    id={`${menuId}-label`}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Create
                  </span>
                  <button
                    type="button"
                    onClick={() => close(true)}
                    aria-label="Close menu"
                    className="rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* grid */}
                <motion.div
                  // Iris reveal: start as a small box at the grid center and open
                  // outward to all four corners, so the menu grows from the middle
                  // in every direction instead of wiping top-down.
                  initial={
                    reduce ? false : { clipPath: "inset(45% 34% 45% 34%)" }
                  }
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{
                    delay: reduce ? 0 : 0.08,
                    duration: 0.45,
                    ease: EASE_OUT,
                  }}
                  id={menuId}
                  role="menu"
                  aria-labelledby={`${menuId}-label`}
                  onKeyDown={onGridKeyDown}
                  className="grid grid-cols-3"
                >
                  {items.map((item, i) => {
                    // Radial stagger: delay each item by its distance from the
                    // grid center so the four corners animate together and the
                    // open reads as center-out, not corner-by-corner.
                    const cols = 3;
                    const rows = Math.ceil(items.length / cols);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const dist = Math.hypot(
                      col - (cols - 1) / 2,
                      row - (rows - 1) / 2,
                    );
                    return (
                      <button
                        key={item.label}
                        ref={(node) => {
                          if (node) itemRefs.current.set(item.label, node);
                          else itemRefs.current.delete(item.label);
                        }}
                        type="button"
                        role="menuitem"
                        tabIndex={item.label === activeId ? 0 : -1}
                        onFocus={() => moveTo(item.label)}
                        onClick={() => {
                          onSelect?.(item.label);
                          close(true);
                        }}
                      // Static cell with hairline borders (no animated fill) so
                      // the grid lines never flicker as items stagger in. Only the
                      // inner content animates.
                      className={cn(
                        "flex items-center justify-center px-3 py-6 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:bg-muted/60 focus-visible:text-foreground",
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
                          delay: reduce ? 0 : 0.1 + dist * 0.07,
                          type: "spring",
                          stiffness: 440,
                          damping: 34,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </motion.span>
                    </button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              ref={triggerRef}
              type="button"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 16 }}
              onClick={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex h-11 w-36 items-center justify-center border border-border bg-card text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* own `layout` counter-scales the label so it stays crisp while the
                  button box morphs, instead of stretching with it */}
              <motion.span
                layout
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                Create
                <Plus className="h-4 w-4" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
