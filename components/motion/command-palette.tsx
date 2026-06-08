"use client";

import { motion } from "motion/react";
import { Search, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  keywords?: string[];
  icon?: LucideIcon;
  onSelect: () => void;
};

export interface CommandPaletteProps {
  items: CommandItem[];
  /** Opens with Cmd/Ctrl + this key. Default: "k" */
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function fuzzyMatch(needle: string, hay: string) {
  if (!needle) return true;
  needle = needle.toLowerCase();
  hay = hay.toLowerCase();
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function CommandPalette({
  items,
  shortcut = "k",
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!controlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        setOpen(!open);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shortcut]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((it) => {
      const haystacks = [it.label, it.group ?? "", ...(it.keywords ?? [])];
      return haystacks.some((h) => fuzzyMatch(query, h));
    });
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      const g = it.group ?? "Results";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[active];
      if (it) {
        it.onSelect();
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  let cursor = 0;

  // Always-mounted container; pointer events fully disabled when closed so clicks pass through to the page.
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: open ? 0.18 : 0.12, ease: EASE }}
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-foreground/45 [backdrop-filter:blur(12px)_saturate(140%)] [-webkit-backdrop-filter:blur(12px)_saturate(140%)]",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4 pt-[18vh]">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            y: open ? 0 : -8,
            scale: open ? 1 : 0.97,
          }}
          transition={
            open
              ? { type: "spring", stiffness: 460, damping: 36, mass: 0.6 }
              : { duration: 0.12, ease: EASE }
          }
          onKeyDown={onKeyDown}
          className={cn(
            "w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl will-change-transform",
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              tabIndex={open ? 0 : -1}
              className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            ) : (
              grouped.map(([group, list]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </div>
                  {list.map((it) => {
                    const idx = cursor++;
                    const isActive = idx === active;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        data-index={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => {
                          it.onSelect();
                          setOpen(false);
                        }}
                        tabIndex={open ? 0 : -1}
                        className={cn(
                          "relative isolate flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="command-active"
                            className="absolute inset-0 z-0 rounded-md bg-primary/[0.05]"
                            transition={{ type: "spring", stiffness: 480, damping: 38 }}
                          />
                        ) : null}
                        {Icon ? <Icon className="relative z-10 h-4 w-4" /> : <span className="relative z-10 h-4 w-4" />}
                        <span className="relative z-10 flex-1 truncate">{it.label}</span>
                        {it.hint ? (
                          <kbd className="relative z-10 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {it.hint}
                          </kbd>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
