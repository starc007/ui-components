"use client";

import { categoryPath, componentPath } from "@/lib/component-paths";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Bot, LayoutGrid, Shapes } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { registry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { Button } from "@/components/motion/button";
import { Tooltip } from "@/components/motion/tooltip";
import { isComponentNew } from "@/lib/component-status";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
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

function SidebarCategoryTab({
  filter: { value: filterValue, label, icon: Icon },
  value,
  onValueChange,
  id,
  panelId,
}: {
  filter: (typeof CATEGORY_FILTERS)[number];
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  panelId: string;
}) {
  const reduce = useReducedMotion();
  const active = value === filterValue;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const activeRef = useRef(active);
  useLayoutEffect(() => { activeRef.current = active; }, [active]);
  // Focus can schedule a tooltip before the click selects this tab. Ignore
  // that delayed request once its label is visible, without rerendering the rail.
  const onTooltipOpenChange = useCallback((open: boolean) => {
    if (open && activeRef.current) return;
    setTooltipOpen(open);
  }, []);

  return (
    <Tooltip
      content={label}
      side="bottom"
      open={!active && tooltipOpen}
      onOpenChange={onTooltipOpenChange}
      wrapperClassName="shrink-0"
    >
      <Button
        id={`${id}-${filterValue}`}
        variant="ghost"
        size="sm"
        role="tab"
        aria-label={label}
        aria-selected={active}
        aria-controls={panelId}
        tabIndex={active ? 0 : -1}
        layout
        layoutDependency={value}
        transition={{ layout: reduce ? { duration: 0 } : SPRING_LAYOUT, scale: SPRING_PRESS }}
        whileHover={undefined}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        style={{ borderRadius: 9999 }}
        onClick={() => {
          setTooltipOpen(false);
          onValueChange(filterValue);
        }}
        className={cn(
          "relative h-8 min-w-8 justify-start gap-0 overflow-hidden border-0 p-0 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40",
          active
            ? "bg-background text-foreground hover:bg-background"
            : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
        )}
      >
        <motion.span
          layout="position"
          layoutDependency={value}
          transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="grid size-8 shrink-0 place-items-center"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </motion.span>
        {/* Keep the label mounted so an interrupted exit cannot remove a reselected label. */}
        <motion.span
          layout="position"
          layoutDependency={value}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: active ? 1 : 0, filter: reduce || active ? "blur(0px)" : "blur(4px)" }}
          transition={{
            layout: reduce ? { duration: 0 } : SPRING_LAYOUT,
            opacity: { duration: active ? 0.18 : 0.1, ease: EASE_OUT },
            filter: { duration: active ? 0.18 : 0.1, ease: EASE_OUT },
          }}
          className={cn("inline-flex shrink-0 overflow-hidden whitespace-nowrap", active ? "w-auto pr-2" : "w-0")}
        >
          {label}
        </motion.span>
      </Button>
    </Tooltip>
  );
}

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
  const reduce = useReducedMotion();

  return (
    <motion.section
      layoutRoot
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
      <motion.div
        layout
        layoutDependency={value}
        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
        style={{ borderRadius: 9999 }}
        role="tablist"
        aria-label="Component categories"
        className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted p-0.5"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <SidebarCategoryTab
            key={filter.value}
            filter={filter}
            value={value}
            onValueChange={onValueChange}
            id={id}
            panelId={panelId}
          />
        ))}
      </motion.div>
    </motion.section>
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
