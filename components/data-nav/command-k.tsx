"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { Search, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  icon?: LucideIcon;
  onSelect: () => void;
};

export interface CommandKProps {
  items: CommandItem[];
  placeholder?: string;
  shortcut?: string;
}

export function CommandK({ items, placeholder = "Search…", shortcut = "k" }: CommandKProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.group?.toLowerCase().includes(q));
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      const g = it.group ?? "Results";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => setActive(0), [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.onSelect();
      setOpen(false);
    }
  };

  let cursor = 0;

  return (
    <AnimatePresence>
      {open ? (
        <Dialog static open={open} onClose={setOpen} className="relative z-[100]">
          <MotionBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 flex items-start justify-center p-4 pt-[20vh]">
            <MotionPanel
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl glass-strong"
              onKeyDown={handleKey}
            >
              <div className="flex items-center gap-3 border-b border-(--color-border) px-4">
                <Search className="h-4 w-4 text-(--color-fg-muted)" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="h-12 flex-1 bg-transparent text-sm text-(--color-fg) placeholder:text-(--color-fg-muted) outline-none"
                />
                <kbd className="hidden rounded border border-(--color-border) bg-(--color-bg) px-1.5 py-0.5 text-[10px] text-(--color-fg-muted) sm:inline-block">
                  ESC
                </kbd>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {grouped.length === 0 ? (
                  <div className="p-8 text-center text-sm text-(--color-fg-muted)">No results</div>
                ) : (
                  grouped.map(([group, list]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-fg-muted)">
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
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => {
                              it.onSelect();
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                              isActive ? "bg-(--color-bg) text-(--color-fg)" : "text-(--color-fg-muted)",
                            )}
                          >
                            {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
                            <span className="flex-1 truncate">{it.label}</span>
                            {it.hint ? <span className="text-xs text-(--color-fg-muted)">{it.hint}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </MotionPanel>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
