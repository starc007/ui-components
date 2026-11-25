"use client";

import {
  Bot,
  Dices,
  GraduationCap,
  Heart,
  Layers,
  LayoutGrid,
  type LucideIcon,
  Newspaper,
  Palette,
  ScrollText,
  SlidersHorizontal,
  Spline,
} from "lucide-react";
import { useTranslations } from "use-intl";
import { MorphNav, type MorphNavItem } from "@/components/app/chrome/morph-nav";
import { categoryPath, isNativePath, NATIVE_PATH } from "@/lib/component-paths";
import { registry } from "@/lib/registry";

const SECTIONS = [
  { slug: "motion", title: "components", icon: Layers },
  { slug: "blocks", title: "blocks", icon: LayoutGrid },
  { slug: "agents", title: "agents", icon: Bot },
  { slug: "casino", title: "casino", icon: Dices },
] as const satisfies readonly { slug: string; title: string; icon: LucideIcon }[];

const RESOURCES = [
  { key: "playground", href: "/playground", icon: SlidersHorizontal },
  { key: "themes", href: "/themes", icon: Palette },
  { key: "motionGuides", href: "/docs/motion-patterns", icon: Spline },
  { key: "howToGuides", href: "/guides", icon: GraduationCap },
  { key: "changelog", href: "/changelog", icon: ScrollText },
  { key: "blog", href: "/blog", icon: Newspaper },
  { key: "sponsors", href: "/sponsors", icon: Heart },
] as const satisfies readonly { key: string; href: string; icon: LucideIcon }[];

/** Installable components in a category, variants included. */
function categoryCount(slug: string) {
  const category = registry.find((candidate) => candidate.slug === slug);
  return (category?.components ?? []).reduce((total, component) => {
    const variants = (component.examples ?? []).filter((example) => example.installSlug).length;
    return total + (variants || 1);
  }, 0);
}

function within(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The header links on every page: a Components menu, Charts, Interactions,
 * Sounds and React Native as links, and a Resources menu.
 */
export function HeaderNav({ pathname }: { pathname: string }) {
  const t = useTranslations("Chrome.header");

  const sections: MorphNavItem[] = SECTIONS.map(({ slug, title, icon: Icon }) => {
    const href = categoryPath(slug);
    const count = categoryCount(slug);
    return {
      href,
      title: t(title),
      description: t(`menu.${title}`),
      icon: <Icon />,
      meta: String(count),
      metaLabel: t("menuCount", { count }),
      current: within(pathname, href),
    };
  });
  const resources: MorphNavItem[] = RESOURCES.map(({ key, href, icon: Icon }) => ({
    href,
    title: t(key),
    description: t(`menu.${key}`),
    icon: <Icon />,
    current: within(pathname, href),
  }));
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
