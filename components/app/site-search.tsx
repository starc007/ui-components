"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette";
import { registry } from "@/lib/registry";

const PAGES = [
  { slug: "ai-agents", name: "AI Agents", href: "/docs/ai-agents" },
  {
    slug: "motion-patterns",
    name: "Motion Guides",
    href: "/docs/motion-patterns",
  },
];

/** Sidebar search trigger backed by the library's own command palette. */
export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo<CommandItem[]>(
    () => [
      ...registry.flatMap((cat) =>
        cat.components.map((comp) => ({
          id: `${cat.slug}-${comp.slug}`,
          label: comp.name,
          group: cat.name,
          keywords: [comp.slug, cat.name],
          onSelect: () => router.push(`/components/${cat.slug}/${comp.slug}`),
        })),
      ),
      ...PAGES.map((page) => ({
        id: page.slug,
        label: page.name,
        group: "Pages",
        keywords: [page.slug],
        onSelect: () => router.push(page.href),
      })),
    ],
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1.5 text-sm text-(--color-fg-muted) transition-colors hover:border-(--color-border-strong) hover:text-(--color-fg)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded border border-(--color-border) bg-(--color-bg) px-1.5 py-0.5 text-[10px] text-(--color-fg-muted)">
          ⌘K
        </kbd>
      </button>
      <CommandPalette
        items={items}
        open={open}
        onOpenChange={setOpen}
        placeholder="Search components…"
      />
    </>
  );
}
