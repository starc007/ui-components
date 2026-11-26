"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { Link } from "@/lib/navigation";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export type MorphNavItem = {
  href: string;
  title: string;
  /** One short line under the title. */
  description?: string;
  /** Shown in a neutral chip before the title. */
  icon?: ReactNode;
  /** Short text at the row's end, such as a count. */
  meta?: string;
  /** What `meta` means, for screen readers. */
  metaLabel?: string;
  /** The row links to the page that is open. */
  current?: boolean;
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
// How far the panel drops as it opens, and rises as it closes.
const DROP_PX = 6;
// Hover intent: a pointer crossing the nav on its way elsewhere should not
// pop a menu open. Only the first open waits; moving between menus while one
// is open stays instant.
const OPEN_DELAY_MS = 90;
// Beyond this distance the panel does not slide between menus, since it would
// sweep across every link in between. The old panel fades out where it was
// and the new one opens under its own trigger.
const SLIDE_MAX_PX = 240;

/**
 * Header menus that share one panel. Hovering a menu opens the panel under
 * it with a short fade and drop; moving to a nearby menu glides the panel
 * across and crossfades its content, and a far one reopens it under its own
 * trigger. Devices without hover open a menu on tap. The panel holds real links, so Tab walks them and Escape hands focus
 * back to the menu's trigger.
 */
export function MorphNav({ entries, className }: { entries: MorphNavEntry[]; className?: string }) {
  const canHover = useHoverCapable();
  const reduce = useReducedMotion() ?? false;
  const panelId = useId();
  const [open, setOpen] = useState<string | null>(null);
  const [x, setX] = useState(0);
  // A new key remounts the panel, for a jump between far-apart menus.
  const [panelKey, setPanelKey] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const closeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const focusOnOpen = useRef(false);

  const openMenu = entries.find(
    (entry): entry is Extract<MorphNavEntry, { kind: "menu" }> =>
      entry.kind === "menu" && entry.id === open,
  );

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const cancelOpen = useCallback(() => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    openTimer.current = null;
  }, []);

  const show = (id: string) => {
    cancelClose();
    cancelOpen();
    if (open === id) return;
    const nextX = triggers.current.get(id)?.offsetLeft ?? 0;
    const far = open !== null && Math.abs(nextX - x) > SLIDE_MAX_PX;
    if (far) setPanelKey((key) => key + 1);
    setX(nextX);
    setOpen(id);
  };

  /** A hovering mouse: open after the intent delay, or at once if a menu is open. */
  const showOnHover = (id: string) => {
    cancelClose();
    if (open !== null) {
      show(id);
      return;
    }
    cancelOpen();
    openTimer.current = window.setTimeout(() => show(id), OPEN_DELAY_MS);
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

  const scheduleClose = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelOpen();
    if (closeTimer.current !== null) return;
    closeTimer.current = window.setTimeout(() => close(false), CLOSE_DELAY_MS);
  };

  const dismiss = useCallback(() => close(true), [close]);
  useDismiss(open !== null, dismiss, rootRef);

  useEffect(
    () => () => {
      cancelClose();
      cancelOpen();
    },
    [cancelClose, cancelOpen],
  );

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
              if (canHover && event.pointerType === "mouse") showOnHover(entry.id);
            }}
            onPointerLeave={cancelOpen}
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
          <PresenceGate key={panelKey}>
            {({ gate }) => (
              <motion.div
                // During a far jump two panels overlap briefly; only the
                // newest may claim the ref, so an exiting one never clears it.
                ref={(node) => {
                  if (node) panelRef.current = node;
                }}
                id={panelId}
                {...gate}
                // The top padding is the bridge the pointer crosses from a
                // trigger to the panel without leaving the nav.
                className="absolute top-full left-0 z-50 pt-2"
                // Opacity and a short drop, no scale: the panel holds text,
                // and scaling it reads as a bounce. The exit mirrors the
                // entry, a little faster.
                initial={{ opacity: 0, y: reduce ? 0 : -DROP_PX, x }}
                animate={{ opacity: 1, y: 0, x }}
                exit={{
                  opacity: 0,
                  y: reduce ? 0 : -DROP_PX,
                  transition: { duration: 0.14, ease: EASE_OUT },
                }}
                transition={{
                  duration: 0.18,
                  ease: EASE_OUT,
                  x: { duration: reduce ? 0 : 0.22, ease: EASE_OUT },
                }}
                onPointerEnter={cancelClose}
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]">
                  {/* popLayout lifts the outgoing menu out of flow, so the
                      incoming one alone sizes the panel while they crossfade. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={openMenu.id}
                      className={cn(
                        "p-2",
                        openMenu.items.some((item) => item.description) ? "w-80" : "w-44",
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, ease: EASE_OUT }}
                    >
                      {/* One hover pill glides between rows, as in the sidebar. */}
                      <SharedLayoutBg
                        as="ul"
                        inset={0}
                        // Panel radius 16 minus its 8px padding.
                        pillClassName="rounded-lg bg-foreground/[0.05]"
                        className="gap-0.5"
                      >
                        {openMenu.items.map((item) => (
                          <li key={item.href}>
                            <MenuRow item={item} onSelect={() => close(false)} />
                          </li>
                        ))}
                      </SharedLayoutBg>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}

/**
 * One menu link. With an icon and description it is a two-line row; the
 * current page gets a dot at the row's end.
 */
function MenuRow({ item, onSelect }: { item: MorphNavItem; onSelect: () => void }) {
  const { href, title, description, icon, meta, metaLabel, current } = item;
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onSelect}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        description ? "px-2 py-2" : "px-3 py-1.5",
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">{title}</span>
        {description ? (
          <span className="block truncate text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {meta ? (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          <span aria-hidden={metaLabel ? true : undefined}>{meta}</span>
          {metaLabel ? <span className="sr-only">{metaLabel}</span> : null}
        </span>
      ) : null}
      {current ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
    </Link>
  );
}
