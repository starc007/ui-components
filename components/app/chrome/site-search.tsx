"use client";

import { Search } from "lucide-react";
import { useTranslations } from "use-intl";
import { useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette";
import { NewBadge } from "@/components/app/docs/new-badge";
import { useRouter } from "@/lib/navigation";
import { nativeComponentPath } from "@/lib/component-paths";
import nativeNav from "@/lib/native/nav.json";
import { componentSearchEntries } from "@/lib/site-search";

// `name` is a Chrome message key; OpenUI is a product name.
const PAGES = [
  { slug: "home", name: "sidebar.home", href: "/" },
  { slug: "playground", name: "header.playground", href: "/playground" },
  { slug: "sponsors", name: "header.sponsors", href: "/sponsors" },
  { slug: "theme", name: "docsPages.themeSetup", href: "/docs/theme" },
  { slug: "ai-agents", name: "docsPages.aiAgents", href: "/docs/ai-agents" },
  {
    slug: "motion-patterns",
    name: "docsPages.motionGuides",
    href: "/docs/motion-patterns",
  },
  { slug: "openui", name: null, href: "/docs/openui" },
  { slug: "native-setup", name: "docsPages.nativeSetup", href: "/docs/native-setup" },
  { slug: "react-native", name: "docsPages.nativeComponents", href: "/react-native" },
] as const;

const noSubscribe = () => () => {};

/**
 * Whether the shortcut reads ⌘ or Ctrl. The server and the first client
 * render say ⌘, so hydration matches; other platforms switch right after.
 */
function useIsMac() {
  return useSyncExternalStore(
    noSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
}

/** Site search trigger backed by the library's own command palette. */
export function SiteSearch({ className }: { className?: string }) {
  const t = useTranslations("Chrome");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isMac = useIsMac();

  // No row icons: every row in a group would repeat the same one, and the
  // group label already names the category. Text rows scan faster.
  const items = useMemo<CommandItem[]>(
    () => [
      ...componentSearchEntries().map((entry) => ({
        ...entry,
        badge: entry.badge === "new" ? <NewBadge launchedAt={entry.launchedAt} /> : undefined,
        onSelect: () => router.push(entry.href),
      })),
      ...nativeNav.map((item) => ({
        id: `native-${item.slug}`,
        label: item.title,
        group: "React Native",
        keywords: [item.slug, "react native", "native", "expo", "mobile"],
        onSelect: () => router.push(nativeComponentPath(item.slug)),
      })),
      ...PAGES.map((page) => ({
        id: page.slug,
        label: page.name ? t(page.name) : "OpenUI",
        group: t("search.pages"),
        keywords: [page.slug],
        onSelect: () => router.push(page.href),
      })),
    ],
    [router, t],
  );

  return (
    <>
      <button
        type="button"
        aria-label={t("search.label")}
        onClick={() => setOpen(true)}
        className={cn(
          "group flex h-9 w-full items-center gap-2 rounded-full border border-border bg-transparent pr-[5px] pl-3 text-sm text-muted-foreground outline-none transition-colors hover:border-(--color-border-strong) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden flex-1 truncate text-left sm:block">{t("search.trigger")}</span>
        {/* A pill 6px inside the field's outer edge on every side (5px of
            padding plus the 1px border): 24px tall in a 36px field, so its
            radius follows the field's. */}
        <kbd
          className="ml-auto hidden h-6 shrink-0 items-center gap-0.5 rounded-full border border-border px-2 font-sans text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-(--color-border-strong) group-hover:text-foreground md:inline-flex"
        >
          <span className={isMac ? "text-xs" : undefined}>{isMac ? "⌘" : "Ctrl"}</span>
          <span>K</span>
        </kbd>
      </button>
      <CommandPalette
        items={items}
        open={open}
        onOpenChange={setOpen}
        placeholder={t("search.placeholder")}
        emptyMessage={t("search.empty")}
        recent="beui-site-search-recent"
      />
    </>
  );
}
