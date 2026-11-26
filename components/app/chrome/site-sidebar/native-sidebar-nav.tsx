"use client";

import { useMessages, useTranslations } from "use-intl";
import { NewBadge } from "@/components/app/docs/new-badge";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { nativeComponentPath } from "@/lib/component-paths";
import { sidebarOrder } from "@/lib/component-status";
import { Link } from "@/lib/navigation";
import { COUNT_CLASS, GROUP_LABEL, linkClass } from "./link-classes";
import { NATIVE_GROUPS, NATIVE_INTRO } from "./nav-data";
import { useRevealActiveLink } from "./use-reveal-active-link";

/** The React Native pages' list: overview, setup, then components by group. */
export function NativeSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Chrome");
  const groupNames: Record<string, string> = useMessages().Chrome.sidebar.nativeGroups;
  const navRef = useRevealActiveLink(pathname);

  return (
    <nav ref={navRef} aria-label={t("sidebar.browseNative")} className="flex flex-col gap-6">
      <div>
        <p className="mb-1.5 block px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          React Native
        </p>
        <SharedLayoutBg inset={0} pillClassName="rounded-full bg-foreground/[0.05]">
          {NATIVE_INTRO.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              prefetch={false}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={onNavigate}
              className={linkClass(pathname === item.href)}
            >
              {item.key ? t(item.key) : item.name}
            </Link>
          ))}
        </SharedLayoutBg>
      </div>
      {NATIVE_GROUPS.map((group) => (
        <div key={group.name}>
          <p className={GROUP_LABEL}>
            {groupNames[group.name] ?? group.name}
            <span className={COUNT_CLASS}>{group.items.length}</span>
          </p>
          <SharedLayoutBg inset={0} pillClassName="rounded-full bg-foreground/[0.05]">
            {sidebarOrder(
              group.items.map((item) => ({
                ...item,
                badge: "launchedAt" in item ? ("new" as const) : undefined,
              })),
              (item) => item.title,
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
