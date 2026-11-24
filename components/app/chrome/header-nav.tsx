"use client";

import { useTranslations } from "use-intl";
import { MorphNav, type MorphNavItem } from "@/components/app/chrome/morph-nav";
import { categoryPath, isNativePath, NATIVE_PATH } from "@/lib/component-paths";

const SECTIONS = [
  { slug: "motion", title: "components" },
  { slug: "blocks", title: "blocks" },
  { slug: "agents", title: "agents" },
  { slug: "casino", title: "casino" },
] as const;

const RESOURCES = [
  { key: "playground", href: "/playground" },
  { key: "motionGuides", href: "/docs/motion-patterns" },
  { key: "howToGuides", href: "/guides" },
  { key: "changelog", href: "/changelog" },
  { key: "blog", href: "/blog" },
  { key: "sponsors", href: "/sponsors" },
] as const;

function within(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The header links on pages without the docs sidebar: a Components menu,
 * Charts, Interactions and React Native as links, and a Resources menu.
 */
export function HeaderNav({ pathname }: { pathname: string }) {
  const t = useTranslations("Chrome.header");

  const sections: MorphNavItem[] = SECTIONS.map(({ slug, title }) => ({
    href: categoryPath(slug),
    title: t(title),
  }));
  const resources: MorphNavItem[] = RESOURCES.map(({ key, href }) => ({ href, title: t(key) }));
  const charts = categoryPath("charts");
  const interactions = categoryPath("micro-interactions");
  const sounds = categoryPath("sounds");

  return (
    <MorphNav
      // Below xl the links do not fit beside search and Get Pro; the menu
      // button covers those widths.
      className="hidden xl:flex"
      entries={[
        {
          kind: "menu",
          id: "components",
          label: t("components"),
          items: sections,
          active: sections.some((item) => within(pathname, item.href)),
        },
        {
          kind: "link",
          id: "charts",
          label: t("charts"),
          href: charts,
          active: within(pathname, charts),
        },
        {
          kind: "link",
          id: "interactions",
          label: t("micro-interactions"),
          href: interactions,
          active: within(pathname, interactions),
        },
        {
          kind: "link",
          id: "sounds",
          label: t("sounds"),
          href: sounds,
          active: within(pathname, sounds),
        },
        {
          kind: "link",
          id: "react-native",
          label: t("reactNative"),
          href: NATIVE_PATH,
          active: isNativePath(pathname),
        },
        {
          kind: "menu",
          id: "resources",
          label: t("resources"),
          items: resources,
          active: resources.some((item) => within(pathname, item.href)),
        },
      ]}
    />
  );
}
