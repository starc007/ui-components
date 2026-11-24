"use client";

import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import { NewBadge } from "@/components/app/docs/new-badge";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { categoryPath, componentPath, topLevelCategory } from "@/lib/component-paths";
import { sidebarOrder } from "@/lib/component-status";
import { Link } from "@/lib/navigation";
import { registry } from "@/lib/registry";
import { variantCopy } from "@/lib/variant-copy";
import { isSplitPage, variantPath } from "@/lib/variant-pages";
import { SidebarCategoryTabs } from "./category-tabs";
import { COUNT_CLASS, linkClass, variantLinkClass } from "./link-classes";
import { INTRO, type NavLink, PATTERNS, SIDEBAR_CATEGORIES } from "./nav-data";
import { useRevealActiveLink } from "./use-reveal-active-link";

export function WebSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Chrome");
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
  // Charts and Casino are their own sections: the sidebar lists only that section.
  const section = topLevelCategory(pathname);
  const isSection = section !== undefined;
  const categoryFilter = filter.value;
  const categories = isSection
    ? registry.filter((category) => category.slug === section)
    : SIDEBAR_CATEGORIES;
  const intro: NavLink[] = isSection
    ? [{ slug: "home", key: "sidebar.home", href: categoryPath(section) }]
    : INTRO;

  return (
    <nav ref={navRef} aria-label={t("sidebar.browseComponents")} className="flex flex-col gap-6">
      {!isSection ? (
        <div className="sticky -top-4 z-20 -mt-4 -mb-4 bg-background pt-4">
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
        {...(isSection ? {} : { role: "tabpanel", "aria-labelledby": `${tabsId}-${categoryFilter}` })}
        className="flex flex-col gap-6"
      >
        <div hidden={!isSection && categoryFilter !== "all"}>
          <p className="mb-1.5 block px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("sidebar.intro")}
          </p>
          <SharedLayoutBg inset={0} pillClassName="rounded-full bg-foreground/[0.05]">
            {intro.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                prefetch={false}
                onClick={onNavigate}
                className={linkClass(pathname === item.href)}
              >
                {item.key ? t(item.key) : item.name}
              </Link>
            ))}
          </SharedLayoutBg>
        </div>
        {!isSection ? (
          <div hidden={categoryFilter !== "all"}>
            <p className="mb-1.5 block px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("sidebar.guides")}
            </p>
            <SharedLayoutBg inset={0} pillClassName="rounded-full bg-foreground/[0.05]">
              {PATTERNS.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  prefetch={false}
                  onClick={onNavigate}
                  className={linkClass(pathname === item.href)}
                >
                  {item.key ? t(item.key) : item.name}
                </Link>
              ))}
            </SharedLayoutBg>
          </div>
        ) : null}
        {categories.map((cat) => (
          <div
            key={cat.slug}
            hidden={!isSection && categoryFilter !== "all" && categoryFilter !== cat.slug}
          >
            <Link
              href={categoryPath(cat.slug)}
              prefetch={false}
              onClick={onNavigate}
              className="mb-1.5 flex items-center gap-2 rounded-full px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {cat.name}
              <span className={COUNT_CLASS}>{cat.components.length}</span>
            </Link>
            <SharedLayoutBg inset={0} pillClassName="rounded-full bg-foreground/[0.05]">
              {sidebarOrder(cat.components, (comp) => comp.name).flatMap((comp) => {
                const href = componentPath(cat.slug, comp.slug);
                const split = isSplitPage(comp);
                const parent = (
                  <Link
                    key={comp.slug}
                    href={href}
                    prefetch={false}
                    aria-current={pathname === href ? "page" : undefined}
                    onClick={onNavigate}
                    className={linkClass(pathname === href)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{comp.name}</span>
                        {split ? (
                          <span className={COUNT_CLASS}>{comp.examples?.length}</span>
                        ) : null}
                      </span>
                      {comp.badge === "new" ? (
                        <NewBadge launchedAt={comp.launchedAt} />
                      ) : null}
                    </span>
                  </Link>
                );
                // A split page lists its variant pages under it while you are
                // on the overview or one of the variants.
                const open =
                  split && (pathname === href || pathname.startsWith(`${href}/`));
                if (!open) return [parent];
                const examples = comp.examples ?? [];
                const activeIndex = examples.findIndex(
                  (example) => pathname === variantPath(cat.slug, comp.slug, example.slug),
                );
                return [
                  parent,
                  ...examples.map((example, index) => {
                    const variantHref = variantPath(cat.slug, comp.slug, example.slug);
                    const name =
                      (example.installSlug && variantCopy[example.installSlug]?.name) ||
                      example.name;
                    return (
                      <Link
                        key={`${comp.slug}/${example.slug}`}
                        href={variantHref}
                        prefetch={false}
                        aria-current={pathname === variantHref ? "page" : undefined}
                        onClick={onNavigate}
                        className={variantLinkClass(
                          index < activeIndex
                            ? "above"
                            : index === activeIndex
                              ? "active"
                              : "below",
                          index === examples.length - 1,
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate">{name}</span>
                          {example.badge === "new" ? (
                            <NewBadge launchedAt={example.launchedAt} />
                          ) : null}
                        </span>
                      </Link>
                    );
                  }),
                ];
              })}
            </SharedLayoutBg>
          </div>
        ))}
      </div>
    </nav>
  );
}
