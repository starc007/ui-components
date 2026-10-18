"use client";

import {
  categoryPath,
  componentPath,
  isNativePath,
  NATIVE_PATH,
  nativeComponentPath,
} from "@/lib/component-paths";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Bot, LayoutGrid, Shapes } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { registry } from "@/lib/registry";
import nativeNav from "@/lib/native/nav.json";
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
  { slug: "native-setup", name: "React Native Setup", href: "/docs/native-setup" },
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

// Native components in catalog order, grouped as the native showcase groups
// them, for the sidebar on /react-native pages.
const NATIVE_GROUPS = nativeNav.reduce<{ name: string; items: typeof nativeNav }[]>(
  (groups, item) => {
    const group = groups.find((entry) => entry.name === item.group);
    if (group) group.items.push(item);
    else groups.push({ name: item.group, items: [item] });
    return groups;
  },
  [],
);

const NATIVE_INTRO = [
  { slug: "native-home", name: "Overview", href: NATIVE_PATH },
  { slug: "native-setup", name: "Setup", href: "/docs/native-setup" },
];

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
          "relative h-8 min-w-8 shrink-0 justify-start gap-0 overflow-hidden border-0 p-0 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40",
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
      className="bg-background pb-3"
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

const COUNT_CLASS =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/[0.06] px-1 text-[10px] font-medium tabular-nums text-muted-foreground";

const GROUP_LABEL =
  "mb-1.5 flex items-center gap-2 rounded-md px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

// Clearance for the sticky category tabs at the top of the desktop sidebar.
const STICKY_CLEARANCE = 64;

/**
 * Keep the current page's link in view when the list mounts or the route
 * changes. A fresh load, a reload or the phone sheet opening would otherwise
 * start the list at the top, far from the reader's place. A visible link is
 * left alone, so clicking an item never moves the list.
 */
function useRevealActiveLink(pathname: string) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const link = Array.from(nav.querySelectorAll("a")).find(
      (anchor) => anchor.getAttribute("href") === pathname,
    );
    // A link inside a filtered-out group has no boxes to reveal.
    if (!link || link.getClientRects().length === 0) return;
    let scroller = nav.parentElement;
    while (scroller && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const view = scroller.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top >= view.top + STICKY_CLEARANCE && item.bottom <= view.bottom) return;
    scroller.scrollTop += item.top - view.top - (view.height - item.height) / 2;
  }, [pathname]);
  return ref;
}

function linkClass(active: boolean) {
  return cn(
    "relative block rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:py-1",
    active
      ? "text-foreground font-medium bg-foreground/[0.06]"
      : "text-muted-foreground hover:text-foreground",
  );
}

/** The React Native pages' list: overview, setup, then components by group. */
function NativeSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const navRef = useRevealActiveLink(pathname);
  const now = Date.now();

  return (
    <nav ref={navRef} aria-label="Browse React Native components" className="flex flex-col gap-6">
      <div>
        <p className="mb-1.5 block px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          React Native
        </p>
        <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
          {NATIVE_INTRO.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              prefetch={false}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={onNavigate}
              className={linkClass(pathname === item.href)}
            >
              {item.name}
            </Link>
          ))}
        </SharedLayoutBg>
      </div>
      {NATIVE_GROUPS.map((group) => (
        <div key={group.name}>
          <p className={GROUP_LABEL}>
            {group.name}
            <span className={COUNT_CLASS}>{group.items.length}</span>
          </p>
          <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
            {moveNewItemsToTop(
              group.items.map((item) => ({
                ...item,
                badge: "launchedAt" in item ? ("new" as const) : undefined,
              })),
              now,
            ).map((item) => {
              const href = nativeComponentPath(item.slug);
              return (
                <Link
                  key={item.slug}
                  href={href}
                  prefetch={false}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={onNavigate}
                  className={linkClass(pathname === href)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.title}</span>
                    {item.badge === "new" ? (
                      <NewBadge launchedAt={item.launchedAt} />
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </SharedLayoutBg>
        </div>
      ))}
    </nav>
  );
}

/** Nav list shared by the desktop sidebar and the mobile bottom sheet. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  if (isNativePath(pathname)) {
    return <NativeSidebarNav pathname={pathname} onNavigate={onNavigate} />;
  }
  return <WebSidebarNav pathname={pathname} onNavigate={onNavigate} />;
}

function WebSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const tabsId = useId();
  const panelId = useId();
  const navRef = useRevealActiveLink(pathname);
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
  const isCharts = pathname === "/charts" || pathname.startsWith("/charts/");
  const categoryFilter = filter.value;
  const now = Date.now();
  const categories = isCharts
    ? registry.filter((category) => category.slug === "charts")
    : SIDEBAR_CATEGORIES;
  const intro = isCharts
    ? [{ slug: "home", name: "Home", href: "/charts" }]
    : INTRO;

  return (
    <nav ref={navRef} aria-label="Browse components" className="flex flex-col gap-6">
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
        className="flex flex-col gap-6"
      >
        <div hidden={!isCharts && categoryFilter !== "all"}>
          <p className="mb-1.5 block px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
            <p className="mb-1.5 block px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
          <div
            key={cat.slug}
            hidden={!isCharts && categoryFilter !== "all" && categoryFilter !== cat.slug}
          >
            <Link
              href={categoryPath(cat.slug)}
              prefetch={false}
              onClick={onNavigate}
              className="mb-1.5 flex items-center gap-2 rounded-md px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {cat.name}
              <span className={COUNT_CLASS}>{cat.components.length}</span>
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
