"use client";

import { categoryPath, componentPath } from "@/lib/component-paths";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Bot, LayoutGrid, Shapes } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import { useId, useState } from "react";
import { registry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { ExpandableButton } from "@/components/motion/expandable-control";
import { Tooltip } from "@/components/motion/tooltip";
import { isComponentNew } from "@/lib/component-status";
import { cn } from "@/lib/utils";

const INTRO = [
  { slug: "home", name: "Home", href: "/components/motion" },
];

const PATTERNS = [
  { slug: "motion-patterns", name: "Motion Guides", href: "/docs/motion-patterns" },
  { slug: "ai-agents", name: "Agent Guide", href: "/docs/ai-agents" },
  { slug: "openui", name: "OpenUI", href: "/docs/openui" },
];

const SIDEBAR_CATEGORY_ORDER: Record<string, number> = {
  agents: 0,
  motion: 1,
  blocks: 2,
};

const SIDEBAR_CATEGORIES = registry.filter((category) => category.slug !== "charts").sort(
  (a, b) =>
    (SIDEBAR_CATEGORY_ORDER[a.slug] ?? Number.MAX_SAFE_INTEGER) -
    (SIDEBAR_CATEGORY_ORDER[b.slug] ?? Number.MAX_SAFE_INTEGER),
);

const CATEGORY_FILTERS = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "agents", label: "Agents", icon: Bot },
  { value: "motion", label: "Components", icon: Shapes },
  { value: "blocks", label: "Blocks", icon: Blocks },
] as const;

export function SidebarCategoryTabs({
  value,
  onValueChange,
  id,
  panelId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  panelId: string;
}) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  return (
    <section
      aria-label="Filter navigation by category"
      className="bg-background pb-4"
      onKeyDown={(event) => {
        if (!(event.target instanceof HTMLButtonElement) || event.target.getAttribute("role") !== "tab") return;
        const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const current = tabs.indexOf(event.target);
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        let next: number;
        switch (event.key) {
          case "ArrowRight": next = current + (rtl ? -1 : 1); break;
          case "ArrowLeft": next = current + (rtl ? 1 : -1); break;
          case "Home": next = 0; break;
          case "End": next = tabs.length - 1; break;
          default: return;
        }
        event.preventDefault();
        const target = tabs[(next + tabs.length) % tabs.length];
        target.focus();
        target.click();
      }}
    >
      <LayoutGroup id={id}>
        <motion.div
          layoutRoot
          role="tablist"
          aria-label="Component categories"
          className="flex min-h-9 items-center justify-between gap-0.5 rounded-full bg-muted p-0.5"
        >
          {CATEGORY_FILTERS.map(({ value: filterValue, label, icon: Icon }) => (
            <Tooltip
              key={filterValue}
              content={label}
              side="bottom"
              open={value !== filterValue && tooltip === filterValue}
              onOpenChange={(open) => {
                setTooltip((current) =>
                  open && value !== filterValue
                    ? filterValue
                    : current === filterValue
                      ? null
                      : current,
                );
              }}
            >
              <ExpandableButton
                id={`${id}-${filterValue}`}
                role="tab"
                aria-selected={value === filterValue}
                aria-controls={panelId}
                tabIndex={value === filterValue ? 0 : -1}
                expanded={value === filterValue}
                label={label}
                icon={<Icon aria-hidden="true" className="size-4" />}
                onClick={() => {
                  setTooltip(null);
                  onValueChange(filterValue);
                }}
                className={cn(
                  "h-8 min-w-8 border-0 p-0 text-xs focus-visible:ring-foreground/40 [&>span:first-child]:size-8 [&>span:nth-child(2)]:pr-2",
                  value === filterValue
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                )}
              />
            </Tooltip>
          ))}
        </motion.div>
      </LayoutGroup>
    </section>
  );
}

function moveNewItemsToTop<
  T extends { badge?: "new"; launchedAt?: string },
>(items: readonly T[], now: number) {
  return [
    ...items.filter((item) => isComponentNew(item, now)),
    ...items.filter((item) => !isComponentNew(item, now)),
  ];
}

function linkClass(active: boolean) {
  return cn(
    "relative block rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
    active
      ? "text-foreground font-medium bg-foreground/[0.06]"
      : "text-muted-foreground hover:text-foreground",
  );
}

/** Nav list shared by the desktop sidebar and the mobile bottom sheet. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const tabsId = useId();
  const panelId = useId();
  const routeCategory = SIDEBAR_CATEGORIES.find((category) => {
    const path = categoryPath(category.slug);
    return pathname === path || pathname.startsWith(`${path}/`);
  })?.slug;
  const [filter, setFilter] = useState({ routeCategory, value: "all" });
  // Keep a filtered sidebar in step with header links and browser history.
  // All remains the default; links within a category preserve its filter.
  if (filter.routeCategory !== routeCategory) {
    setFilter({ routeCategory, value: filter.value === "all" ? "all" : (routeCategory ?? "all") });
  }
  const categoryFilter = filter.value;
  const now = Date.now();
  const isCharts = pathname === "/charts" || pathname.startsWith("/charts/");
  const categories = isCharts
    ? registry.filter((category) => category.slug === "charts")
    : SIDEBAR_CATEGORIES;
  const intro = isCharts
    ? [{ slug: "home", name: "Home", href: "/charts" }]
    : INTRO;

  return (
    <nav aria-label="Browse components" className="flex flex-col gap-8">
      {!isCharts ? (
        <div className="sticky -top-6 z-20 -mt-6 -mb-4 bg-background pt-6">
          <SidebarCategoryTabs
            id={tabsId}
            panelId={panelId}
            value={categoryFilter}
            onValueChange={(value) => setFilter({ routeCategory, value })}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-4 bg-gradient-to-b from-background to-transparent"
          />
        </div>
      ) : null}
      <div
        id={panelId}
        {...(isCharts ? {} : { role: "tabpanel", "aria-labelledby": `${tabsId}-${categoryFilter}` })}
        className="flex flex-col gap-8"
      >
        <div hidden={!isCharts && categoryFilter !== "all"}>
          <p className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Intro
          </p>
          <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
            {intro.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                prefetch={false}
                onClick={onNavigate}
                className={linkClass(pathname === item.href)}
              >
                {item.name}
              </Link>
            ))}
          </SharedLayoutBg>
        </div>
        {!isCharts ? (
          <div hidden={categoryFilter !== "all"}>
            <p className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Guides
            </p>
            <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
              {PATTERNS.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  prefetch={false}
                  onClick={onNavigate}
                  className={linkClass(pathname === item.href)}
                >
                  {item.name}
                </Link>
              ))}
            </SharedLayoutBg>
          </div>
        ) : null}
        {categories.map((cat) => (
          <div key={cat.slug} hidden={!isCharts && categoryFilter !== "all" && categoryFilter !== cat.slug}>
            <Link
              href={categoryPath(cat.slug)}
              prefetch={false}
              onClick={onNavigate}
              className="mb-2 flex items-center gap-2 rounded-md px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {cat.name}
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/[0.06] px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                {cat.components.length}
              </span>
            </Link>
            <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
              {moveNewItemsToTop(cat.components, now).map((comp) => {
                const href = componentPath(cat.slug, comp.slug);
                return (
                  <Link
                    key={comp.slug}
                    href={href}
                    prefetch={false}
                    aria-current={pathname === href ? "page" : undefined}
                    onClick={onNavigate}
                    className={linkClass(pathname === href)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate">{comp.name}</span>
                      {comp.badge === "new" ? (
                        <NewBadge launchedAt={comp.launchedAt} />
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </SharedLayoutBg>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function SiteSidebar() {
  return (
    <aside aria-label="Site navigation">
      <SidebarNav />
    </aside>
  );
}
