"use client";

import { CircleDashed, FileText, Search, Smartphone } from "lucide-react";
import { useMessages, useTranslations } from "use-intl";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette";
import { NewBadge } from "@/components/app/docs/new-badge";
import { useRouter } from "@/i18n/navigation";
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

/** Site search trigger backed by the library's own command palette. */
export function SiteSearch({ className }: { className?: string }) {
  const t = useTranslations("Chrome");
  const messages = useMessages();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo<CommandItem[]>(
    () => [
      ...componentSearchEntries(messages).map((entry) => ({
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
        label: page.name ? t(page.name) : "OpenUI",
        group: t("search.pages"),
        keywords: [page.slug],
        icon: FileText,
        onSelect: () => router.push(page.href),
      })),
    ],
    [router, t, messages],
  );

  return (
    <>
      <button
        type="button"
        aria-label={t("search.label")}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-full border border-border bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:border-(--color-border-strong) hover:text-foreground",
          className,
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden flex-1 text-left sm:block">{t("search.trigger")}</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-block">
          ⌘K
        </kbd>
      </button>
      <CommandPalette
        items={items}
        open={open}
        onOpenChange={setOpen}
        placeholder={t("search.placeholder")}
        emptyMessage={t("search.empty")}
      />
    </>
  );
}
