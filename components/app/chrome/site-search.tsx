"use client";

import { CircleDashed, FileText, Search, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette";
import { NewBadge } from "@/components/app/docs/new-badge";
import { nativeComponentPath } from "@/lib/component-paths";
import nativeNav from "@/lib/native/nav.json";
import { componentSearchEntries } from "@/lib/site-search";

const PAGES = [
  { slug: "home", name: "Home", href: "/" },
  { slug: "playground", name: "Playground", href: "/playground" },
  { slug: "sponsors", name: "Sponsors", href: "/sponsors" },
  { slug: "theme", name: "Theme setup", href: "/docs/theme" },
  { slug: "ai-agents", name: "AI Agents", href: "/docs/ai-agents" },
  {
    slug: "motion-patterns",
    name: "Motion Guides",
    href: "/docs/motion-patterns",
  },
  { slug: "openui", name: "OpenUI", href: "/docs/openui" },
  { slug: "native-setup", name: "React Native Setup", href: "/docs/native-setup" },
  { slug: "react-native", name: "React Native components", href: "/react-native" },
];

/** Site search trigger backed by the library's own command palette. */
export function SiteSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo<CommandItem[]>(
    () => [
      ...componentSearchEntries.map((entry) => ({
        ...entry,
        icon: CircleDashed,
        badge: entry.badge === "new" ? <NewBadge launchedAt={entry.launchedAt} /> : undefined,
        onSelect: () => router.push(entry.href),
      })),
      ...nativeNav.map((item) => ({
        id: `native-${item.slug}`,
        label: item.title,
        group: "React Native",
        keywords: [item.slug, "react native", "native", "expo", "mobile"],
        icon: Smartphone,
        onSelect: () => router.push(nativeComponentPath(item.slug)),
      })),
      ...PAGES.map((page) => ({
        id: page.slug,
        label: page.name,
        group: "Pages",
        keywords: [page.slug],
        icon: FileText,
        onSelect: () => router.push(page.href),
      })),
    ],
    [router],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Search components"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-full border border-border bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:border-(--color-border-strong) hover:text-foreground",
          className,
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden flex-1 text-left sm:block">Search</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-block">
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
