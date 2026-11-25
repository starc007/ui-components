"use client";

import { observeElementRect, useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Search, type LucideIcon } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "@/lib/ease";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useOnOpen } from "@/lib/hooks/use-on-open";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { useMessages } from "@/lib/i18n";
import { useTouchCapable } from "@/lib/hooks/use-touch-capable";
import { PresenceGate } from "@/lib/presence-gate";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import { searchCommands } from "@/lib/command-search";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  keywords?: string[];
  icon?: LucideIcon;
  badge?: ReactNode;
  onSelect: () => void;
};

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const commandPaletteMessages = {
  placeholder: "Type a command or search…",
  empty: "No results found.",
  close: "Close command palette",
  dialog: "Command palette",
  list: "Commands",
  results: "Results",
  navigate: "Navigate",
  select: "Select",
  dismiss: "Close",
  recent: "Recent",
  clearRecent: "Clear recent",
};

export type CommandPaletteMessages = typeof commandPaletteMessages;

export interface CommandPaletteProps {
  items: CommandItem[];
  /** Opens with Cmd/Ctrl + this key. Default: "k" */
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override any built-in string. `results` names items without a `group`. */
  labels?: Partial<CommandPaletteMessages>;
  /**
   * Remember the commands people pick and list them first, under "Recent",
   * while the search is empty. Saved in localStorage; pass a string to choose
   * the storage key. Default: off
   */
  recent?: boolean | string;
  /** How many recent commands to keep. Default: 5 */
  recentLimit?: number;
  /** Classes for the dialog panel. */
  className?: string;
}

const RECENT_KEY = "beui-command-palette-recent";

/** Recent command ids, newest first. Storage can be blocked or hold junk. */
function readRecent(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(key: string, ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(key, JSON.stringify(ids));
    else localStorage.removeItem(key);
  } catch {
    // Storage blocked (private mode, quota): recents just don't persist.
  }
}

// Opened by a shortcut many times a day, so it must read as instant: a short
// fade and drop, no scale, and an exit that mirrors it a little faster.
const PANEL_IN = { duration: 0.18, ease: EASE_OUT } as const;
const PANEL_OUT = { duration: 0.14, ease: EASE_OUT } as const;
const DROP_PX = 8;
// The active row's tint follows arrow keys; a short tween keeps it on the row
// without lag or overshoot.
const HIGHLIGHT = { duration: 0.15, ease: EASE_OUT } as const;

// Fixed sizes the list height is computed from; keep in step with the
// classes below (p-2, label pt-1.5 pb-1 with a 16px line, mb-2, h-9 rows).
const LIST_PAD = 16;
const GROUP_LABEL = 26;
const GROUP_GAP = 8;
const ROW = 36;
// Room for the empty state when nothing matches a short list.
const LIST_MIN = 160;
// The list's tallest size (22rem); it may be shorter on short screens.
const LIST_MAX = 352;

type Entry =
  | { kind: "label"; key: string; group: string; size: number }
  | { kind: "row"; key: string; item: CommandItem; index: number; size: number };

const KEY =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border px-1 font-sans text-[11px] text-muted-foreground";

export function CommandPalette({
  items,
  shortcut = "k",
  placeholder: placeholderProp,
  emptyMessage: emptyMessageProp,
  open: controlledOpen,
  onOpenChange,
  labels,
  recent = false,
  recentLimit = 5,
  className,
}: CommandPaletteProps) {
  const t = useMessages("commandPalette", commandPaletteMessages, labels);
  const placeholder = placeholderProp ?? t("placeholder");
  const emptyMessage = emptyMessageProp ?? t("empty");
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (!controlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  const [query, setQuery] = useState("");
  // Portal target only exists client-side; render nothing during SSR/hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const uid = useId();
  const reduce = useReducedMotion();
  const canTouch = useTouchCapable();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === shortcut.toLowerCase()
      ) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shortcut, setOpen]);

  // A modal dialog: Tab stays inside, Escape closes, and focus goes back to
  // whatever opened it.
  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusTrap(open && mounted, panelRef, { onEscape: close });
  useScrollLock(open);

  const filtered = useMemo(() => searchCommands(items, query), [items, query]);

  const recentKey = recent ? (typeof recent === "string" ? recent : RECENT_KEY) : null;
  // A palette rendered already open has no opening render for `useOnOpen` to
  // catch, so the first state reads storage too. On the server the read finds
  // no storage and returns nothing; the palette renders nothing there anyway.
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    open && recentKey ? readRecent(recentKey) : [],
  );
  // Recent ids that still name an item, newest first. Ids of commands that
  // have since gone are dropped rather than shown as blanks.
  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => items.find((it) => it.id === id))
        .filter((it): it is CommandItem => Boolean(it))
        .slice(0, recentLimit),
    [recentIds, items, recentLimit],
  );
  // Recents show only while the search is empty; typing searches everything.
  const showRecent = recentItems.length > 0 && query.trim() === "";

  // Reserve the icon column only when at least one item brings an icon, so
  // icon-less lists don't render a dead gap before every label.
  const hasIcons = useMemo(() => items.some((it) => it.icon), [items]);

  // The list is as tall as the unfiltered items need (rows and group labels
  // have fixed heights), capped, and keeps that height while results filter,
  // so the panel never jumps as you type and a short list leaves no void.
  // Recents move rows into their own group, so they add one label.
  const listHeight = useMemo(() => {
    const groups = new Set(items.map((it) => it.group ?? "")).size + (recentItems.length ? 1 : 0);
    return LIST_PAD + groups * GROUP_LABEL + Math.max(0, groups - 1) * GROUP_GAP + items.length * ROW;
  }, [items, recentItems.length]);

  const fallbackGroup = t("results");
  const recentLabel = t("recent");
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    // A recent command is listed once, at the top, not again in its group.
    const listed = new Set(showRecent ? recentItems : []);
    filtered.forEach((it) => {
      if (listed.has(it)) return;
      const g = it.group ?? fallbackGroup;
      const groupItems = map.get(g) ?? [];
      groupItems.push(it);
      map.set(g, groupItems);
    });
    const groups = Array.from(map.entries());
    return showRecent ? [[recentLabel, recentItems] as [string, CommandItem[]], ...groups] : groups;
  }, [filtered, fallbackGroup, showRecent, recentItems, recentLabel]);

  // Grouping reorders the list, so the rendered order is not the filtered
  // order whenever two groups interleave. Everything that has to agree on
  // "which row" — the highlight, the ids, Enter, the scroll — reads this one
  // array, so they cannot drift apart.
  const rows = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);

  const { activeIndex: active, moveTo, moveActive } = useRowCursor(rows, query);

  // The list is virtualized: group labels and rows become one flat list of
  // fixed heights, and only the slice in view (plus a little overscan) is
  // drawn. Opening or typing over hundreds of commands then renders a dozen
  // rows, not all of them. `rows` stays whole, so the cursor, Enter and the
  // ids still see every result.
  const entries = useMemo(() => {
    const out: Entry[] = [];
    let index = 0;
    grouped.forEach(([group, list], groupIndex) => {
      out.push({
        kind: "label",
        key: `group:${group}`,
        group,
        size: GROUP_LABEL + (groupIndex > 0 ? GROUP_GAP : 0),
      });
      for (const item of list) out.push({ kind: "row", key: item.id, item, index: index++, size: ROW });
    });
    return out;
  }, [grouped]);
  // Entry index of each row, so the cursor can scroll its row into view.
  const rowEntry = useMemo(
    () => entries.flatMap((entry, i) => (entry.kind === "row" ? [i] : [])),
    [entries],
  );

  const visibleHeight = Math.min(Math.max(listHeight, LIST_MIN), LIST_MAX);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => listRef.current,
    estimateSize: (i) => entries[i]?.size ?? ROW,
    getItemKey: (i) => entries[i]?.key ?? i,
    paddingStart: LIST_PAD / 2,
    paddingEnd: LIST_PAD / 2,
    overscan: 6,
    // The list's size before it is measured, so the opening render already
    // holds the rows in view instead of an empty frame.
    initialRect: { width: 0, height: visibleHeight },
    // A list that measures 0 tall (no layout yet, or a test DOM) keeps its
    // known height, so its rows still render and the active row exists.
    observeElementRect: (instance, cb) =>
      observeElementRect(instance, (rect) =>
        cb(rect.height > 0 ? rect : { width: rect.width, height: visibleHeight }),
      ),
    enabled: open,
  });
  // Rows drawn right now. The field names the active row only when it is
  // one of them, so the reference never points at a missing element.
  const drawnRows = new Set(
    virtualizer.getVirtualItems().flatMap((virtual) => {
      const entry = entries[virtual.index];
      return entry?.kind === "row" ? [entry.index] : [];
    }),
  );

  // Clearing the query would drop the cursor on its own, but only if it had
  // changed; `moveTo(null)` covers reopening on an already-empty query.
  useOnOpen(open, () => {
    setQuery("");
    moveTo(null);
    if (recentKey) setRecentIds(readRecent(recentKey));
  });

  const select = (it: CommandItem) => {
    if (recentKey) {
      const next = [it.id, ...readRecent(recentKey).filter((id) => id !== it.id)].slice(
        0,
        recentLimit,
      );
      writeRecent(recentKey, next);
      setRecentIds(next);
    }
    it.onSelect();
    setOpen(false);
  };

  const clearRecent = () => {
    if (recentKey) writeRecent(recentKey, []);
    setRecentIds([]);
    // The button goes away with the recents; keep focus in the palette.
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      // Enter on a focused button (a row, Clear recent) presses that button.
      if (e.target !== inputRef.current) return;
      e.preventDefault();
      const it = rows[active];
      if (it) select(it);
    }
  };

  // Keep the cursor's row in view. Its row may not be drawn yet, so this
  // scrolls by index rather than to an element. The first row also brings
  // its group label along, which is where a new query lands: the cursor
  // returns to it and `rowEntry` changes, so this runs for every query.
  useEffect(() => {
    if (!open || rows.length === 0) return;
    if (active === 0) virtualizer.scrollToOffset(0);
    else {
      const entry = rowEntry[active];
      if (entry !== undefined) virtualizer.scrollToIndex(entry, { align: "auto" });
    }
  }, [active, open, rows.length, rowEntry, virtualizer]);

  if (!mounted) return null;

  // Portaled to <body> so ancestors with transforms, filters, or fixed
  // positioning can't trap the overlay in their stacking context, and mounted
  // only while open. The chrome is two fixed siblings rather than one wrapper:
  // the backdrop spans the viewport edges but carries the scrim colour, and the
  // layer positioning the panel is inset off every edge. Both hang off
  // `PresenceGate`, so interaction releases in the same commit that starts the
  // exit rather than when it ends — `open` is already false for those frames.
  return createPortal(
    <AnimatePresence initial={false}>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label={t("close")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: PANEL_OUT }}
              transition={PANEL_IN}
              {...gate}
              onClick={() => setOpen(false)}
              // A plain dim, no full-viewport blur: it keeps the page legible
              // behind the panel and costs nothing to paint on mobile.
              className="pointer-events-auto fixed inset-0 z-[100] bg-black/25 dark:bg-black/50"
            />
          )}
        </PresenceGate>
      ) : null}

      {open ? (
        <PresenceGate key="panel-layer">
          {({ isPresent, gate }) => (
            // The layer itself never takes pointer events, so it carries
            // `inert` alone rather than the gate's pointer-events value.
            <div
              inert={!isPresent}
              className="pointer-events-none fixed inset-x-4 bottom-4 top-[18vh] z-[100] flex items-start justify-center"
            >
              <motion.div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={t("dialog")}
                initial={{ opacity: 0, y: reduce ? 0 : -DROP_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -DROP_PX, transition: PANEL_OUT }}
                transition={PANEL_IN}
                {...gate}
                onKeyDown={onKeyDown}
                className={cn(
                  "pointer-events-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_48px_-12px_rgb(0_0_0/0.25)] outline-none",
                  className,
                )}
              >
                <div className="flex items-center gap-3 border-b border-border px-4">
                  <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    role="combobox"
                    // The field only exists while the palette is open.
                    aria-expanded="true"
                    aria-controls={`${uid}-list`}
                    aria-activedescendant={
                      drawnRows.has(active) ? `${uid}-opt-${active}` : undefined
                    }
                    aria-autocomplete="list"
                    className={cn(
                      "h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none",
                      // The palette focuses this field the moment it opens, and iOS
                      // zooms the page in on a focused field under 16px: the fixed
                      // overlay is magnified off-center — clipped leading edge, half
                      // an icon column — and the zoom outlives the palette. 16px on
                      // touch keeps the page at scale 1; pointer devices keep 14px.
                      canTouch && "text-base",
                    )}
                  />
                </div>
                <div
                  ref={listRef}
                  id={`${uid}-list`}
                  role="listbox"
                  aria-label={t("list")}
                  style={{ height: `min(${visibleHeight}px, 55vh)` }}
                  // Vertical padding lives in the virtualizer (paddingStart and
                  // paddingEnd), so its offsets match the scroll position.
                  className="overflow-y-auto overscroll-contain px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {rows.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="flex size-10 items-center justify-center rounded-full border border-border"
                      >
                        <Search className="size-4" />
                      </span>
                      {emptyMessage}
                    </div>
                  ) : (
                    // One namespace per query: the highlight glides between
                    // rows while you arrow through them, but never flies across
                    // a list that just re-filtered under it.
                    <LayoutGroup id={`${uid}-${query}`}>
                    <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                    {virtualizer.getVirtualItems().map((virtual) => {
                      const entry = entries[virtual.index];
                      if (!entry) return null;
                      const place = {
                        height: virtual.size,
                        transform: `translateY(${virtual.start}px)`,
                      };
                      if (entry.kind === "label") {
                        return (
                          <div
                            key={virtual.key}
                            aria-hidden
                            style={place}
                            className="absolute top-0 left-0 flex w-full items-end px-3 pb-1 text-xs font-medium text-muted-foreground"
                          >
                            {entry.group}
                          </div>
                        );
                      }
                      const { item: it, index: idx } = entry;
                      const isActive = idx === active;
                      const Icon = it.icon;
                      return (
                            <button
                              key={virtual.key}
                              type="button"
                              id={`${uid}-opt-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              // Not every option is in the DOM, so each says
                              // where it sits in the whole list.
                              aria-setsize={rows.length}
                              aria-posinset={idx + 1}
                              data-index={idx}
                              style={place}
                              onMouseEnter={() => moveTo(it.id)}
                              onClick={() => select(it)}
                              className={cn(
                                "absolute top-0 left-0 isolate flex w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors duration-150",
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {isActive ? (
                                <motion.span
                                  layoutId="active"
                                  // A light tint of the text colour, not a gray fill.
                                  className="absolute inset-0 z-0 rounded-lg bg-foreground/[0.06]"
                                  transition={reduce ? { duration: 0 } : HIGHLIGHT}
                                />
                              ) : null}
                              {Icon ? (
                                <Icon aria-hidden="true" className="relative z-10 size-4 shrink-0" />
                              ) : hasIcons ? (
                                <span className="relative z-10 size-4 shrink-0" />
                              ) : null}
                              <span className="relative z-10 flex-1 truncate">
                                {it.label}
                              </span>
                              {it.badge ? (
                                <span className="relative z-10 shrink-0">
                                  {it.badge}
                                </span>
                              ) : null}
                              {it.hint ? (
                                <kbd className={cn(KEY, "relative z-10 shrink-0 bg-background")}>
                                  {it.hint}
                                </kbd>
                              ) : null}
                            </button>
                      );
                    })}
                    </div>
                    </LayoutGroup>
                  )}
                </div>
                {/* Key hints for keyboards, and Clear recent. The button sits
                    here rather than in the list, which may only hold options.
                    It stays while you type, so the footer never comes and
                    goes under a touch keyboard. */}
                {canTouch && recentItems.length === 0 ? null : (
                  <div className="flex h-10 shrink-0 items-center gap-4 border-t border-border px-4 text-xs text-muted-foreground">
                    {canTouch ? null : (
                      <>
                        <span aria-hidden="true" className="inline-flex items-center gap-1.5">
                          <kbd className={KEY}>↑</kbd>
                          <kbd className={KEY}>↓</kbd>
                          {t("navigate")}
                        </span>
                        <span aria-hidden="true" className="inline-flex items-center gap-1.5">
                          <kbd className={KEY}>↵</kbd>
                          {t("select")}
                        </span>
                      </>
                    )}
                    <span className="ml-auto inline-flex items-center gap-4">
                      {recentItems.length ? (
                        <button
                          type="button"
                          onClick={clearRecent}
                          className="-mx-2 rounded-full px-2 py-1 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {t("clearRecent")}
                        </button>
                      ) : null}
                      {canTouch ? null : (
                        <span aria-hidden="true" className="inline-flex items-center gap-1.5">
                          <kbd className={KEY}>Esc</kbd>
                          {t("dismiss")}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
