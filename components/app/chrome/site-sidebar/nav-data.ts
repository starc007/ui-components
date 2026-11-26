import { NATIVE_PATH, TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import nativeNav from "@/lib/native/nav.json";
import { registry } from "@/lib/registry";

// `key` is a Chrome message key; a null key keeps `name` (a product name).
export type NavLink = {
  slug: string;
  href: string;
  key: "sidebar.home" | "sidebar.overview" | "sidebar.setup" | `docsPages.${
    "motionGuides" | "agentGuide" | "nativeSetup"
  }` | null;
  name?: string;
};

export const INTRO: NavLink[] = [
  { slug: "home", key: "sidebar.home", href: "/components/motion" },
  { slug: "react-native", key: null, name: "React Native", href: NATIVE_PATH },
];

export const PATTERNS: NavLink[] = [
  { slug: "motion-patterns", key: "docsPages.motionGuides", href: "/docs/motion-patterns" },
  { slug: "ai-agents", key: "docsPages.agentGuide", href: "/docs/ai-agents" },
  { slug: "openui", key: null, name: "OpenUI", href: "/docs/openui" },
  { slug: "native-setup", key: "docsPages.nativeSetup", href: "/docs/native-setup" },
];

const SIDEBAR_CATEGORY_ORDER: Record<string, number> = {
  agents: 0,
  motion: 1,
  blocks: 2,
};

export const SIDEBAR_CATEGORIES = registry.filter((category) => !TOP_LEVEL_CATEGORIES.includes(category.slug)).sort(
  (a, b) =>
    (SIDEBAR_CATEGORY_ORDER[a.slug] ?? Number.MAX_SAFE_INTEGER) -
    (SIDEBAR_CATEGORY_ORDER[b.slug] ?? Number.MAX_SAFE_INTEGER),
);

// Native components in catalog order, grouped as the native showcase groups
// them, for the sidebar on /react-native pages.
export const NATIVE_GROUPS = nativeNav.reduce<{ name: string; items: typeof nativeNav }[]>(
  (groups, item) => {
    const group = groups.find((entry) => entry.name === item.group);
    if (group) group.items.push(item);
    else groups.push({ name: item.group, items: [item] });
    return groups;
  },
  [],
);

export const NATIVE_INTRO: NavLink[] = [
  { slug: "native-home", key: "sidebar.overview", href: NATIVE_PATH },
  { slug: "native-setup", key: "sidebar.setup", href: "/docs/native-setup" },
];
