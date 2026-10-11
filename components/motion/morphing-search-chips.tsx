"use client";

import { Clock, Search, X } from "lucide-react";
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
  useId,
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

// The surface's size rides the layout spring; its contents only fade. Rows are
// laid out at their final place from the first frame, so they wait until the
// surface has nearly reached them and are gone before it starts to shrink back.
const CONTENT_IN: Transition = { duration: 0.16, ease: EASE_OUT, delay: 0.14 };
const CONTENT_OUT: Transition = { duration: 0.06, ease: EASE_OUT };
// Half the 56px bar: a pill when closed, the same corners when grown.
const SURFACE_RADIUS = 28;

type Row = { id: string; label: string; kind: "query" | "recent" | "suggestion" };

export interface MorphingSearchChipsProps {
  /** Active filters shown as chips inside the bar. */
  chips?: string[];
  defaultChips?: string[];
  onChipsChange?: (chips: string[]) => void;
  /** Recent searches, newest first. */
  recents?: string[];
  defaultRecents?: string[];
  onRecentsChange?: (recents: string[]) => void;
  /** Terms offered while typing, matched by substring. */
  suggestions?: string[];
  /** How many recent searches to keep. Default 5. */
  maxRecents?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  return [current, set] as const;
}

const sameTerm = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function MorphingSearchChips({
  chips: chipsProp,
  defaultChips = [],
  onChipsChange,
  recents: recentsProp,
  defaultRecents = [],
  onRecentsChange,
  suggestions = [],
  maxRecents = 5,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Search",
  label = "Search",
  actions,
  className,
}: MorphingSearchChipsProps) {
  const reduce = useReducedMotion();
  const [chips, setChips] = useControllable(chipsProp, defaultChips, onChipsChange);
  const [recents, setRecents] = useControllable(recentsProp, defaultRecents, onRecentsChange);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;

  const trimmed = query.trim();
  const rows = useMemo<Row[]>(() => {
    if (!trimmed) {
      return recents.map((term) => ({ id: `recent:${term}`, label: term, kind: "recent" }));
    }
    const needle = trimmed.toLowerCase();
    const seen = new Set([needle, ...chips.map((chip) => chip.toLowerCase())]);
    const matches: Row[] = [];
    for (const [kind, pool] of [
      ["recent", recents],
      ["suggestion", suggestions],
    ] as const) {
      for (const term of pool) {
        const key = term.toLowerCase();
        if (seen.has(key) || !key.includes(needle)) continue;
        seen.add(key);
        matches.push({ id: `${kind}:${term}`, label: term, kind });
      }
    }
    return [{ id: `query:${trimmed}`, label: trimmed, kind: "query" }, ...matches.slice(0, 6)];
  }, [trimmed, recents, suggestions, chips]);

  const { activeIndex, moveTo, moveActive } = useRowCursor(rows, trimmed);
  const active = rows[activeIndex];

  // A fresh session each time the panel opens: the highlight starts at the top.
  useOnOpen(open, () => moveTo(null));

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismiss(open, close, rootRef);

  const addChip = (term: string) => {
    const value = term.trim();
    if (!value) return;
    if (!chips.some((chip) => sameTerm(chip, value))) {
      setChips([...chips, value]);
      setAnnouncement(`Added filter ${value}`);
    }
    setRecents(
      [value, ...recents.filter((recent) => !sameTerm(recent, value))].slice(0, maxRecents),
    );
    setQuery("");
  };

  const removeChip = (term: string) => {
    setChips(chips.filter((chip) => chip !== term));
    setAnnouncement(`Removed filter ${term}`);
    inputRef.current?.focus();
  };

  const removeRecent = (term: string) => {
    setRecents(recents.filter((recent) => recent !== term));
    setAnnouncement(`Removed ${term} from recent searches`);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter") {
      if (!open || !active) return;
      event.preventDefault();
      addChip(active.label);
      return;
    }
    if (event.key === "Delete" && open && active?.kind === "recent") {
      event.preventDefault();
      removeRecent(active.label);
      return;
    }
    if (event.key === "Backspace" && query === "" && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
  };

  // A press anywhere on the bar that is not its own control lands in the field.
  const focusField = (event: ReactPointerEvent) => {
    if ((event.target as Element).closest("button, input, a")) return;
    event.preventDefault();
    inputRef.current?.focus();
    setOpen(true);
  };

  const layout = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const showList = rows.length > 0;

  return (
    // The root keeps the closed bar's footprint, so the surface grows over the
    // page instead of pushing it.
    // biome-ignore lint/a11y/noStaticElementInteractions: Observes focus leaving the whole widget; the field and buttons own interaction.
    <div
      ref={rootRef}
      className={cn("relative h-14 w-full max-w-xl", className)}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        {/* One surface: the bar itself grows up and out into the panel. */}
        <motion.div
          layout
          transition={layout}
          style={{ borderRadius: SURFACE_RADIUS }}
          className={cn(
            // Glass: a thin tint of the page colour over a saturated blur, a hairline
            // edge, a top highlight and a soft drop. Written inline so the install
            // carries it without the site's stylesheet.
            "pointer-events-auto relative flex min-w-0 flex-col overflow-hidden border border-foreground/[0.08] bg-background/55 backdrop-blur-[20px] backdrop-saturate-[1.6]",
            "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_24px_60px_-24px_rgb(0_0_0/0.45)]",
            open ? "w-full" : "w-fit max-w-full",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              // popLayout lifts the leaving panel out of flow through its ref, so the
              // surface can shrink while it fades. The motion element has to be the
              // direct child for that; the gate goes one level in.
              <motion.div
                key="panel"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: reduce ? { duration: 0.12 } : CONTENT_IN }}
                exit={{ opacity: 0, transition: CONTENT_OUT }}
                transition={layout}
                className="w-full"
              >
                <PresenceGate>
                  {({ gate }) => (
                  <div {...gate} className="px-2 pt-2">
                    <div className="flex h-9 items-center justify-between px-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {trimmed ? "Suggestions" : "Recent"}
                      </span>
                      {!trimmed && recents.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRecents([]);
                            setAnnouncement("Cleared recent searches");
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
                      >
                        {rows.map((row, index) => {
                          const selected = index === activeIndex;
                          return (
                            // Options are driven from the combobox field (arrows, Enter) and
                            // never take focus themselves, as aria-activedescendant expects.
                            <motion.div
                              key={row.id}
                              id={`${id}-${index}`}
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
                                <Clock aria-hidden="true" className="relative size-4 text-muted-foreground" />
                              ) : (
                                <Search aria-hidden="true" className="relative size-4 text-muted-foreground" />
                              )}
                              <span className="relative min-w-0 flex-1 truncate">{row.label}</span>
                              {row.kind === "recent" ? (
                                // Pointer shortcut only: the option cannot hold a second control,
                                // and Delete removes the highlighted recent from the keyboard.
                                <span
                                  aria-hidden="true"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeRecent(row.label);
                                  }}
                                  className="relative grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                                >
                                  <X className="size-3.5" />
                                </span>
                              ) : null}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-3 pb-2 pt-1 text-sm text-muted-foreground">No recent searches</p>
                    )}
                    <div aria-hidden="true" className="mx-3 mt-2 h-px bg-border" />
                  </div>
                  )}
                </PresenceGate>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.div
            layout="position"
            transition={layout}
            onPointerDown={focusField}
            className="flex h-14 min-w-0 shrink-0 cursor-text items-center gap-2 pl-4 pr-2"
          >
            <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <div
              // The trailing padding is where a scrolled chip fades out; with room to
              // spare it is empty, so the fade is invisible.
              className={cn(
                "flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]",
                chips.length > 0 &&
                  "-mr-1.5 pr-3 [mask-image:linear-gradient(to_right,#000_calc(100%-12px),transparent)]",
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((chip) => (
                  <motion.span
                    key={chip}
                    layout={reduce ? false : "position"}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.85, transition: { duration: 0.12 } }
                    }
                    transition={reduce ? { duration: 0.12 } : SPRING_SWAP}
                    className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-foreground/[0.07] pl-3 pr-1 text-sm text-foreground"
                  >
                    {chip}
                    <button
                      type="button"
                      aria-label={`Remove filter ${chip}`}
                      onClick={() => removeChip(chip)}
                      className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label={label}
              aria-expanded={open}
              aria-controls={open && showList ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={open && showList ? `${id}-${activeIndex}` : undefined}
              aria-describedby={hintId}
              autoComplete="off"
              spellCheck={false}
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
                "h-9 min-w-24 text-ellipsis bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground",
                open && "flex-1",
              )}
            />
            {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
          </motion.div>
        </motion.div>
      </div>

      <span id={hintId} className="sr-only">
        Enter adds a filter. Backspace in an empty field removes the last one. Delete removes the
        highlighted recent search.
      </span>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
