"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { EASE_IN, EASE_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { Link } from "@/lib/navigation";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export type MorphNavItem = {
  href: string;
  title: string;
};

export type MorphNavEntry =
  | {
      kind: "menu";
      id: string;
      label: string;
      items: MorphNavItem[];
      active: boolean;
    }
  | { kind: "link"; id: string; label: string; href: string; active: boolean };

const TRIGGER =
  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

// Long enough to cross a neighbouring link on the way to the next menu, short
// enough that leaving the nav feels immediate.
const CLOSE_DELAY_MS = 140;
// How far the menu content travels when the panel swaps between menus.
const SWAP_OFFSET = 24;

/**
 * Header menus that share one panel. Hovering a menu opens the panel under
 * it; moving to another menu slides the same panel across and swaps its
 * content in the direction of travel. Devices without hover open a menu on
 * tap. The panel holds real links, so Tab walks them and Escape hands focus
 * back to the menu's trigger.
 */
export function MorphNav({ entries, className }: { entries: MorphNavEntry[]; className?: string }) {
  const canHover = useHoverCapable();
  const reduce = useReducedMotion() ?? false;
  const panelId = useId();
  const [open, setOpen] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [x, setX] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const closeTimer = useRef<number | null>(null);
  const focusOnOpen = useRef(false);

  const menuIds = entries.filter((entry) => entry.kind === "menu").map((entry) => entry.id);
  const openMenu = entries.find(
    (entry): entry is Extract<MorphNavEntry, { kind: "menu" }> =>
      entry.kind === "menu" && entry.id === open,
  );

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const show = (id: string) => {
    cancelClose();
    if (open === id) return;
    setDirection(open ? Math.sign(menuIds.indexOf(id) - menuIds.indexOf(open)) : 0);
    setX(triggers.current.get(id)?.offsetLeft ?? 0);
    setOpen(id);
  };

  const close = useCallback(
    (restoreFocus: boolean) => {
      cancelClose();
      if (restoreFocus && open && rootRef.current?.contains(document.activeElement)) {
        triggers.current.get(open)?.focus({ preventScroll: true });
      }
      setOpen(null);
    },
    [cancelClose, open],
  );

  // Variants read `custom` at exit time, so the outgoing menu leaves in the
  // direction of the new one rather than the one it arrived with.
  const swap = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * SWAP_OFFSET }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : -dir * SWAP_OFFSET }),
  };

  const scheduleClose = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse" || closeTimer.current !== null) return;
    closeTimer.current = window.setTimeout(() => close(false), CLOSE_DELAY_MS);
  };

  const dismiss = useCallback(() => close(true), [close]);
  useDismiss(open !== null, dismiss, rootRef);

  useEffect(() => cancelClose, [cancelClose]);

  // A keyboard open moves focus to the first link once the panel is in.
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, [open]);

  return (
    <nav
      ref={rootRef}
      className={cn("relative flex items-center gap-0.5", className)}
      onPointerLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(false);
      }}
    >
      {entries.map((entry) => {
        if (entry.kind === "link") {
          return (
            <Link
              key={entry.id}
              href={entry.href}
              onPointerEnter={scheduleClose}
              className={cn(
                TRIGGER,
                entry.active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </Link>
          );
        }
        const expanded = open === entry.id;
        return (
          <button
            key={entry.id}
            ref={(node) => {
              if (node) triggers.current.set(entry.id, node);
              else triggers.current.delete(entry.id);
            }}
            type="button"
            aria-expanded={expanded}
            aria-controls={expanded ? panelId : undefined}
            onPointerEnter={(event) => {
              if (canHover && event.pointerType === "mouse") show(entry.id);
            }}
            onClick={(event) => {
              // A hovering mouse already opened it; a click must not shut it.
              if (canHover && event.detail > 0) {
                show(entry.id);
                return;
              }
              if (expanded) close(false);
              else {
                focusOnOpen.current = event.detail === 0;
                show(entry.id);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusOnOpen.current = true;
                show(entry.id);
                if (expanded) panelRef.current?.querySelector<HTMLElement>("a")?.focus();
              }
            }}
            className={cn(
              TRIGGER,
              entry.active || expanded
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {entry.label}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform duration-200 ease-out",
                expanded && "rotate-180",
              )}
            />
          </button>
        );
      })}

      <AnimatePresence>
        {openMenu ? (
          <PresenceGate>
            {({ gate }) => (
              <motion.div
                ref={panelRef}
                id={panelId}
                {...gate}
                // The top padding is the bridge the pointer crosses from a
                // trigger to the panel without leaving the nav.
                className="absolute top-full left-0 z-50 origin-top-left pt-2"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.94, y: reduce ? 0 : -4, x }}
                animate={{ opacity: 1, scale: 1, y: 0, x }}
                exit={{
                  opacity: 0,
                  scale: reduce ? 1 : 0.97,
                  y: reduce ? 0 : -4,
                  transition: { duration: 0.14, ease: EASE_IN },
                }}
                transition={
                  reduce
                    ? { duration: 0.15, ease: EASE_OUT }
                    : { default: SPRING_PANEL, x: SPRING_LAYOUT, opacity: { duration: 0.16, ease: EASE_OUT } }
                }
                onPointerEnter={cancelClose}
              >
                {/* The surface takes the size of the menu in it and springs
                    between sizes through `layout`, a transform, never a width
                    or height animation. Radius and shadow are inline styles so
                    motion keeps them true while the box scales. */}
                <motion.div
                  layout
                  transition={{ layout: reduce ? { duration: 0 } : SPRING_LAYOUT }}
                  style={{ borderRadius: 16, boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.16)" }}
                  className="relative overflow-hidden border border-border bg-background"
                >
                  {/* popLayout lifts the outgoing menu out of flow, so the
                      incoming one alone sizes the surface. */}
                  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                      key={openMenu.id}
                      layout="position"
                      custom={direction}
                      className="w-44 p-2"
                      variants={swap}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={
                        reduce
                          ? { duration: 0.15, ease: EASE_OUT }
                          : { x: SPRING_LAYOUT, opacity: { duration: 0.16, ease: EASE_OUT } }
                      }
                    >
                      {/* One hover pill glides between rows, as in the sidebar. */}
                      <SharedLayoutBg
                        as="ul"
                        inset={0}
                        pillClassName="rounded-full bg-foreground/[0.05]"
                        className="gap-0.5"
                      >
                        {openMenu.items.map(({ href, title }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              prefetch={false}
                              onClick={() => close(false)}
                              className="block truncate rounded-full px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                            >
                              {title}
                            </Link>
                          </li>
                        ))}
                      </SharedLayoutBg>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
