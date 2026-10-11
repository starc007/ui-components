"use client";

import { Clock, LoaderCircle, Search, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useOnOpen } from "@/lib/hooks/use-on-open";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

// The panel's glass grows out of the bar on a spring with a little give: the
// shared tokens are critically damped, and this one is meant to land with a
// soft overshoot, so it stays local. It folds back faster than it grew.
const SPRING_MORPH = { type: "spring", stiffness: 380, damping: 28, mass: 0.8 } as const;
const MORPH_ENTER: Transition = { ...SPRING_MORPH, opacity: { duration: 0.1 } };
const MORPH_EXIT: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 40,
  mass: 0.6,
  opacity: { duration: 0.12, delay: 0.1 },
};
// The pill the panel starts from and returns to: centred, and tucked halfway
// behind the bar (across the 8px gap) so it emerges from the bar's edge.
const SEED = { width: 112, height: 40 };
const SEED_TUCK = 28;
// Content fades in once the shape has mostly arrived and leaves before it goes.
const CONTENT_IN: Transition = { duration: 0.18, ease: EASE_OUT, delay: 0.12 };
const CONTENT_OUT: Transition = { duration: 0.08, ease: EASE_OUT };
// Glass: a thin tint of the page colour over a saturated blur, a hairline edge,
// a top highlight and a soft drop. Written inline so the install carries it
// without the site's stylesheet.
const GLASS =
  "border border-foreground/[0.08] bg-background/55 backdrop-blur-[20px] backdrop-saturate-[1.6] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_24px_60px_-24px_rgb(0_0_0/0.45)]";
// Chips arrive on a soft spring with a touch of blur and leave on a short tween,
// faster than they came.
const CHIP_HIDDEN = { opacity: 0, scale: 0.6, filter: "blur(4px)" };
const CHIP_SHOWN = { opacity: 1, scale: 1, filter: "blur(0px)" };
const CHIP_ENTER: Transition = {
  ...SPRING_SWAP,
  opacity: { duration: 0.16 },
  filter: { duration: 0.2 },
};
const CHIP_EXIT: Transition = { duration: 0.16, ease: EASE_OUT };
// Half the 56px bar: a pill, and the panel shares its corners.
const SURFACE_RADIUS = 28;
// Room the panel wants above the bar before "auto" sends it below instead.
const PANEL_ROOM = 320;

type Row = { id: string; label: string; kind: "query" | "recent" | "suggestion" };
type Side = "top" | "bottom";

export interface MorphingSearchChipsProps {
  /** Active filters shown as chips inside the bar. */
  chips?: string[];
  defaultChips?: string[];
  onChipsChange?: (chips: string[]) => void;
  /** Text in the field. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Recent searches, newest first. */
  recents?: string[];
  defaultRecents?: string[];
  onRecentsChange?: (recents: string[]) => void;
  /** Persist uncontrolled recents in localStorage under this key. */
  storageKey?: string;
  /** How many recent searches to keep. Default 5. */
  maxRecents?: number;
  /** Terms offered while typing. */
  suggestions?: string[];
  /**
   * How suggestions match the query. Default: case-insensitive substring.
   * Pass `false` when `suggestions` already arrive filtered, e.g. from a server.
   */
  filter?: ((term: string, query: string) => boolean) | false;
  /** How many matches to list under the typed query. Default 6. */
  maxSuggestions?: number;
  /** Suggestions are being fetched. */
  loading?: boolean;
  /** Most chips allowed at once. */
  maxChips?: number;
  /** Clean a term before it becomes a chip; return null to reject it. */
  normalize?: (term: string) => string | null;
  /** Shown when the field is empty and there are no recent searches. */
  emptyState?: ReactNode;
  /** Which way the surface grows. "auto" grows up unless there is no room. Default "top". */
  side?: "top" | "bottom" | "auto";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Submit each chip with a form under this name. */
  name?: string;
  placeholder?: string;
  /** Accessible name for the search field. */
  label?: string;
  /** Trailing controls inside the bar, such as filter buttons. */
  actions?: ReactNode;
  className?: string;
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = useState(initial);
  const current = value ?? internal;
  const set = useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, set, setInternal] as const;
}

const sameTerm = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const contains = (term: string, query: string) => term.toLowerCase().includes(query.toLowerCase());

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold">{text.slice(at, at + query.length)}</span>
      {text.slice(at + query.length)}
    </>
  );
}

export function MorphingSearchChips({
  chips: chipsProp,
  defaultChips = [],
  onChipsChange,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  recents: recentsProp,
  defaultRecents = [],
  onRecentsChange,
  storageKey,
  maxRecents = 5,
  suggestions = [],
  filter,
  maxSuggestions = 6,
  loading = false,
  maxChips,
  normalize,
  emptyState,
  side = "top",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  name,
  placeholder = "Search",
  label = "Search",
  actions,
  className,
}: MorphingSearchChipsProps) {
  const reduce = useReducedMotion();
  const [chips, setChips] = useControllable(chipsProp, defaultChips, onChipsChange);
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange);
  const [recents, setRecentsState, setStoredRecents] = useControllable(
    recentsProp,
    defaultRecents,
    onRecentsChange,
  );
  const [openState, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const open = openState && !disabled;
  const [announcement, setAnnouncement] = useState({ text: "", count: 0 });
  const [markedChip, setMarkedChip] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Side>(side === "bottom" ? "bottom" : "top");
  const [rtl, setRtl] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const optionId = (index: number) => `${id}-option-${index}`;

  // The same message twice is still news; the count makes each one a change.
  const announce = useCallback(
    (text: string) => setAnnouncement((current) => ({ text, count: current.count + 1 })),
    [],
  );

  // A chip the keyboard has marked for removal, held by identity. Cleared rather
  // than ignored once it leaves, so the same term added back is not born marked.
  const marked = markedChip !== null && chips.includes(markedChip) ? markedChip : null;
  if (markedChip !== null && marked === null) setMarkedChip(null);

  // The glass grows toward the measured size of the panel's content.
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const panelObserver = useRef<ResizeObserver | null>(null);
  const measurePanel = useCallback((node: HTMLDivElement | null) => {
    panelObserver.current?.disconnect();
    panelObserver.current = null;
    if (!node) return;
    const read = () => setPanelSize({ width: node.offsetWidth, height: node.offsetHeight });
    read();
    panelObserver.current = new ResizeObserver(read);
    panelObserver.current.observe(node);
  }, []);

  const chipsLatest = useRef(chips);
  useLayoutEffect(() => {
    chipsLatest.current = chips;
  });

  // Direction decides which way chips unroll and which arrow walks back into them.
  useLayoutEffect(() => {
    if (rootRef.current) setRtl(getComputedStyle(rootRef.current).direction === "rtl");
  }, []);

  // Recents persist only when the component owns them.
  const persist = storageKey && recentsProp === undefined ? storageKey : null;
  useEffect(() => {
    if (!persist) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(persist) ?? "null");
      if (Array.isArray(stored)) {
        setStoredRecents(
          stored.filter((term): term is string => typeof term === "string").slice(0, maxRecents),
        );
      }
    } catch {
      // Storage can be blocked or hold something else; recents simply start empty.
    }
  }, [persist, maxRecents, setStoredRecents]);

  const setRecents = (next: string[]) => {
    setRecentsState(next);
    if (!persist) return;
    try {
      window.localStorage.setItem(persist, JSON.stringify(next));
    } catch {
      // A full or blocked store keeps this session's recents in memory only.
    }
  };

  const trimmed = query.trim();
  const rows = useMemo<Row[]>(() => {
    if (!trimmed) {
      return recents.map((term) => ({ id: `recent:${term}`, label: term, kind: "recent" }));
    }
    const seen = new Set([trimmed.toLowerCase(), ...chips.map((chip) => chip.toLowerCase())]);
    const matches: Row[] = [];
    const pools = [
      ["recent", recents, contains],
      ["suggestion", suggestions, filter === false ? () => true : (filter ?? contains)],
    ] as const;
    for (const [kind, pool, matchFn] of pools) {
      for (const term of pool) {
        const key = term.toLowerCase();
        if (seen.has(key) || !matchFn(term, trimmed)) continue;
        seen.add(key);
        matches.push({ id: `${kind}:${term}`, label: term, kind });
      }
    }
    return [
      { id: `query:${trimmed}`, label: trimmed, kind: "query" },
      ...matches.slice(0, maxSuggestions),
    ];
  }, [trimmed, recents, suggestions, chips, filter, maxSuggestions]);

  const { activeIndex, moveTo, moveActive } = useRowCursor(rows, trimmed);
  const active = rows[activeIndex];
  const showList = rows.length > 0;
  // Nothing to say means nothing to grow for: the bar still widens on focus.
  const hasPanel = showList || loading || (!trimmed && emptyState != null);
  const panelOpen = open && hasPanel;

  // A fresh session each time the panel opens: the highlight starts at the top.
  useOnOpen(open, () => moveTo(null));

  // The tallest the panel has been since it opened. Typing can grow the card but
  // never shrink it; each new session starts from its own content again.
  const [panelFloor, setPanelFloor] = useState(0);
  useOnOpen(panelOpen, () => setPanelFloor(0));
  const rowsObserver = useRef<ResizeObserver | null>(null);
  const measureRows = useCallback((node: HTMLDivElement | null) => {
    rowsObserver.current?.disconnect();
    rowsObserver.current = null;
    if (!node) return;
    // The wrapper's p-2 adds 16px around the rows.
    const read = () => setPanelFloor((floor) => Math.max(floor, node.offsetHeight + 16));
    read();
    rowsObserver.current = new ResizeObserver(read);
    rowsObserver.current.observe(node);
  }, []);

  // "auto" picks a side as the panel opens and keeps it until it closes.
  useLayoutEffect(() => {
    if (!panelOpen) return;
    if (side !== "auto") {
      setPlaced(side);
      return;
    }
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = rect.top;
    const below = window.innerHeight - rect.bottom;
    setPlaced(above < PANEL_ROOM && below > above ? "bottom" : "top");
  }, [panelOpen, side]);

  // Arrow keys can walk past the visible rows of a capped list.
  const activeOptionId = panelOpen && showList ? optionId(activeIndex) : undefined;
  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismiss(open, close, rootRef);

  // A chip added past the visible edge of a crowded row scrolls into view.
  const chipCount = useRef(chips.length);
  useEffect(() => {
    const row = chipsRef.current;
    const added = chips.length > chipCount.current;
    chipCount.current = chips.length;
    if (!row || !added || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: rtl ? -row.scrollWidth : row.scrollWidth, behavior: reduce ? "auto" : "smooth" });
  }, [chips.length, reduce, rtl]);

  const full = maxChips !== undefined && chips.length >= maxChips;

  const addChip = (term: string) => {
    const value = normalize ? normalize(term) : term.trim();
    if (!value) return;
    const exists = chips.some((chip) => sameTerm(chip, value));
    if (!exists && full) {
      announce(`Up to ${maxChips} filters`);
      return;
    }
    if (!exists) {
      setChips([...chips, value]);
      announce(`Added filter ${value}`);
    }
    setRecents([value, ...recents.filter((recent) => !sameTerm(recent, value))].slice(0, maxRecents));
    setQuery("");
  };

  const removeChip = (term: string) => {
    setChips(chips.filter((chip) => chip !== term));
    announce(`Removed filter ${term}`);
    inputRef.current?.focus();
  };

  const removeRecent = (term: string) => {
    setRecents(recents.filter((recent) => recent !== term));
    announce(`Removed ${term} from recent searches`);
  };

  // Steps the marked chip from the one it is on now, inside the update, so two
  // presses in one batch move two chips.
  const stepMark = (direction: 1 | -1) =>
    setMarkedChip((current) => {
      const list = chipsLatest.current;
      if (list.length === 0) return null;
      const at = current === null ? list.length : list.indexOf(current);
      const next = at + direction;
      if (next >= list.length) return null;
      return list[Math.max(next, 0)];
    });

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // An input method is still composing; Enter and arrows belong to it.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const field = event.currentTarget;
    const atStart = field.selectionStart === 0 && field.selectionEnd === 0;
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";

    if (marked !== null) {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        setMarkedChip(null);
        removeChip(marked);
        return;
      }
      if (event.key === back || event.key === forward) {
        event.preventDefault();
        stepMark(event.key === back ? -1 : 1);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setMarkedChip(null);
        return;
      }
      setMarkedChip(null);
    }

    if (event.key === "Escape" && query !== "") {
      // Clear before closing: one press undoes typing, the next leaves.
      event.preventDefault();
      event.stopPropagation();
      setQuery("");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter") {
      if (!panelOpen || !active) return;
      event.preventDefault();
      addChip(active.label);
      return;
    }
    if (event.key === "Delete" && panelOpen && active?.kind === "recent") {
      event.preventDefault();
      removeRecent(active.label);
      return;
    }
    if (event.key === "Backspace" && atStart && chips.length > 0) {
      // Mark first, remove on the second press: one stray key never loses a filter.
      event.preventDefault();
      const last = chips[chips.length - 1];
      setMarkedChip(last);
      announce(`${last} selected. Press Backspace again to remove it.`);
      return;
    }
    if (event.key === back && atStart && chips.length > 0) {
      event.preventDefault();
      stepMark(-1);
    }
  };

  // A press anywhere on the bar that is not its own control lands in the field.
  const focusField = (event: ReactPointerEvent) => {
    if (disabled || (event.target as Element).closest("button, input, a")) return;
    event.preventDefault();
    inputRef.current?.focus();
    setOpen(true);
  };

  const layout = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const below = placed === "bottom";
  const seed = { ...SEED, y: below ? -SEED_TUCK : SEED_TUCK };

  const panel = (
    <>
      <div className="flex h-9 items-center justify-between px-3">
        <span className="text-xs font-medium text-muted-foreground">
          {trimmed ? "Suggestions" : "Recent"}
        </span>
        {!trimmed && recents.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setRecents([]);
              announce("Cleared recent searches");
              inputRef.current?.focus();
            }}
            className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        ) : null}
      </div>
      {showList ? (
        <div
          id={listId}
          role="listbox"
          aria-label={trimmed ? "Suggestions" : "Recent searches"}
          aria-busy={loading || undefined}
          className="max-h-[min(20rem,45vh)] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
        >
          {rows.map((row, index) => {
            const selected = index === activeIndex;
            return (
              // Options are driven from the combobox field (arrows, Enter) and
              // never take focus themselves, as aria-activedescendant expects.
              <motion.div
                key={row.id}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => moveTo(row.id)}
                onClick={() => addChip(row.label)}
                className="relative flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm text-foreground"
              >
                {selected ? (
                  <motion.span
                    layoutId={`${id}-active`}
                    transition={layout}
                    className="absolute inset-0 rounded-2xl bg-foreground/[0.06]"
                  />
                ) : null}
                {row.kind === "recent" ? (
                  <Clock aria-hidden="true" className="relative size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Search aria-hidden="true" className="relative size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="relative min-w-0 flex-1 truncate">
                  {row.kind === "query" ? row.label : <Highlight text={row.label} query={trimmed} />}
                </span>
                {row.kind === "recent" ? (
                  // Pointer shortcut only: the option cannot hold a second control,
                  // and Delete removes the highlighted recent from the keyboard.
                  <span
                    aria-hidden="true"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeRecent(row.label);
                    }}
                    className="relative grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </span>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      ) : !trimmed && emptyState != null ? (
        <div className="px-3 pb-2 pt-1 text-sm text-muted-foreground">{emptyState}</div>
      ) : null}
      {loading ? (
        <div className="flex h-11 items-center gap-3 px-3 text-sm text-muted-foreground">
          <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
          Searching…
        </div>
      ) : null}
    </>
  );

  return (
    // The root keeps the bar's footprint; the panel floats over the page beside it.
    // biome-ignore lint/a11y/noStaticElementInteractions: Observes focus leaving the whole widget; the field and buttons own interaction.
    <div
      ref={rootRef}
      className={cn(
        "relative flex h-14 w-full max-w-xl justify-center",
        disabled && "opacity-60",
        className,
      )}
      onBlur={(event) => {
        if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
        setMarkedChip(null);
        close();
      }}
    >
      <AnimatePresence>
        {panelOpen ? (
          <PresenceGate key="panel">
            {({ gate }) => (
              <div
                {...gate}
                className={cn(
                  "absolute inset-x-0 z-10",
                  below ? "top-full mt-2" : "bottom-full mb-2",
                )}
              >
                {/* The card's glass starts as a small pill on the bar's edge and
                    springs out to the size of what it holds, then back on close.
                    Width and height animate rather than scale so the corners stay
                    true; the layer is absolute and decorative, so nothing reflows. */}
                <motion.div
                  aria-hidden="true"
                  initial={reduce ? { opacity: 0 } : { ...seed, opacity: 0 }}
                  animate={{
                    width: panelSize.width || SEED.width,
                    height: panelSize.height || SEED.height,
                    y: 0,
                    opacity: 1,
                  }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0.12 } }
                      : { ...seed, opacity: 0, transition: MORPH_EXIT }
                  }
                  transition={reduce ? { duration: 0 } : MORPH_ENTER}
                  style={{ borderRadius: SURFACE_RADIUS, x: "-50%" }}
                  className={cn("absolute left-1/2", below ? "top-0" : "bottom-0", GLASS)}
                />
                {/* Content waits for the shape to arrive and leaves before it goes. */}
                <motion.div
                  initial={{ opacity: 0, y: reduce ? 0 : below ? -6 : 6 }}
                  animate={{ opacity: 1, y: 0, transition: reduce ? { duration: 0.15 } : CONTENT_IN }}
                  exit={{ opacity: 0, transition: CONTENT_OUT }}
                  ref={measurePanel}
                  // Never shorter than this session's tallest list, so narrowing a
                  // search leaves empty glass instead of pulling the card down.
                  style={{ minHeight: panelFloor || undefined }}
                  className="relative p-2"
                >
                  <div ref={measureRows}>{panel}</div>
                </motion.div>
              </div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        transition={layout}
        onPointerDown={focusField}
        style={{ borderRadius: SURFACE_RADIUS }}
        className={cn(
          // Raised over the panel so the growing shape emerges from behind it.
          "relative z-20 flex h-14 min-w-0 items-center gap-2 ps-4",
          GLASS,
          disabled ? "cursor-not-allowed" : "cursor-text",
          // Trailing buttons carry their own inset; bare text needs the full one.
          actions ? "pe-2" : "pe-4",
          open ? "w-full" : "w-fit max-w-full",
        )}
      >
        <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <div
              ref={chipsRef}
              // The padding at each end is where a scrolled chip fades out; with
              // nothing scrolled under it the padding is empty, so the fade is
              // invisible. Relative, so a leaving chip popped out of flow stays
              // inside the scrolling row.
              className={cn(
                "relative flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]",
                chips.length > 0 &&
                  "-mx-1.5 px-3 [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%-12px),transparent)]",
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((chip) => (
                  <motion.span
                    key={chip}
                    layout={reduce ? false : "position"}
                    initial={reduce ? { opacity: 0 } : CHIP_HIDDEN}
                    animate={reduce ? { opacity: 1 } : CHIP_SHOWN}
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0.1 } }
                        : { ...CHIP_HIDDEN, transition: CHIP_EXIT }
                    }
                    transition={reduce ? { duration: 0.12 } : CHIP_ENTER}
                    // Grown from and folded back into the edge it is attached to, so a
                    // chip reads as unrolling out of the one before it.
                    style={{ transformOrigin: rtl ? "right center" : "left center" }}
                    className={cn(
                      "flex h-9 shrink-0 items-center gap-1 rounded-full ps-3 pe-1 text-sm text-foreground transition-[background-color,box-shadow] duration-150",
                      marked === chip
                        ? // Inset: the chip fills its scrolling row, which clips anything drawn outside it.
                        "bg-foreground/[0.12] ring-2 ring-inset ring-foreground/40"
                        : "bg-foreground/[0.07]",
                    )}
                  >
                    <span className="max-w-40 truncate" title={chip}>
                      {chip}
                    </span>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={`Remove filter ${chip}`}
                      onClick={() => removeChip(chip)}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <motion.input
              ref={inputRef}
              // Glides aside as chips arrive and back as they leave.
              layout={reduce ? false : "position"}
              transition={layout}
              type="text"
              role="combobox"
              aria-label={label}
              aria-expanded={panelOpen}
              aria-controls={panelOpen && showList ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              aria-describedby={hintId}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              disabled={disabled}
              value={query}
              placeholder={placeholder}
              onChange={(event) => {
                setQuery(event.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              // Escape closes the panel but leaves focus here; a click brings it back.
              onClick={() => setOpen(true)}
              onKeyDown={onKeyDown}
              // At rest the field is as wide as its placeholder, so the bar hugs its content.
              style={open ? undefined : { width: `${Math.max(placeholder.length, 6) + 2}ch` }}
              className={cn(
                // On a narrow screen the chips scroll first; the field keeps room to type.
                "h-9 min-w-24 text-ellipsis bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
                open && "flex-1",
              )}
            />
            {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </motion.div>

      {name
        ? chips.map((chip) => <input key={chip} type="hidden" name={name} value={chip} />)
        : null}
      <span id={hintId} className="sr-only">
        Enter adds a filter. Backspace at the start of the field selects the last filter, and
        again removes it. Delete removes the highlighted recent search.
      </span>
      <span aria-live="polite" className="sr-only">
        {announcement.text}
        {/* Alternates an invisible character so a repeated message still changes. */}
        {announcement.count % 2 ? " " : ""}
      </span>
    </div>
  );
}
