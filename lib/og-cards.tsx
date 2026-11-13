import type { ReactElement } from "react";
import { native } from "@/lib/native";
import { ogImage } from "@/lib/og";
import { type OgCardKind, ogImagePath } from "@/lib/og-paths";
import { allComponents, registry } from "@/lib/registry";
import { clampText } from "@/lib/seo";
import { seoPagePath, seoPages } from "@/lib/seo-pages";

// The card art has room for roughly this much body text before it overflows.
const OG_DESCRIPTION_LIMIT = 120;

const PAGE_CARDS = {
  openui: {
    title: "OpenUI + beUI",
    description:
      "Register animated React components, generate OpenUI Lang, and render an interactive UI stream.",
    label: "Integration guide",
    command: "beui.dev/docs/openui",
  },
  "native-setup": {
    title: "beUI Native setup",
    description:
      "Install Reanimated, Gesture Handler and Uniwind, add the theme tokens, then copy in any component.",
    label: "React Native",
    command: "beui.dev/docs/native-setup",
  },
  guides: {
    title: "React animation guides",
    description:
      "How to build common animated React interfaces, step by step, with beUI components.",
    label: "Guides",
    command: "beui.dev/guides",
  },
  alternatives: {
    title: "Compare beUI",
    description:
      "How beUI compares with other animated React component libraries, and when each one is the better pick.",
    label: "Comparison",
    command: "beui.dev/alternatives",
  },
  "react-native": {
    title: "Animated React Native components",
    description:
      "Built for touch with Reanimated, Gesture Handler and Uniwind. Copy the source into any Expo or React Native app.",
    label: "React Native",
    command: "npx beui-native add ...",
  },
} as const;

type Card = {
  /** Published path, e.g. /og/cards/component/button.png. */
  path: string;
  kind?: OgCardKind;
  slug?: string;
  title: string;
  description: string;
  label: string;
  command: string;
  homepage: boolean;
};

/**
 * Every social card the site links, rendered to PNG once per build by
 * scripts/build-static.ts. Same card art as the old /api/og route.
 */
export function ogCards(): Card[] {
  const card = (
    kind: OgCardKind | undefined,
    slug: string | undefined,
    fields: Omit<Card, "path" | "kind" | "slug" | "homepage" | "description"> & {
      description: string;
    },
  ): Card => ({
    path: ogImagePath(kind, slug),
    kind,
    slug,
    homepage: !kind,
    ...fields,
    description: clampText(fields.description, OG_DESCRIPTION_LIMIT),
  });

  return [
    card(undefined, undefined, {
      title: "beui",
      description: "Animated components. Ready to make yours.",
      label: "Motion components",
      command: "npx shadcn add @beui/...",
    }),
    ...allComponents().map((component) =>
      card("component", component.slug, {
        title: component.name,
        description: component.description,
        label: "Component",
        command: `npx shadcn add @beui/${component.slug}`,
      }),
    ),
    ...registry.map((category) =>
      card("category", category.slug, {
        title: category.name,
        description: category.description,
        label: category.name,
        command: "npx shadcn add @beui/...",
      }),
    ),
    ...native.components.map((component) =>
      card("native", component.slug, {
        title: component.title,
        description: component.description,
        label: "React Native",
        command: `npx beui-native add ${component.slug}`,
      }),
    ),
    ...Object.entries(PAGE_CARDS).map(([slug, page]) => card("page", slug, page)),
    ...(["guides", "alternatives"] as const).flatMap((kind) =>
      seoPages(kind).map((page) =>
        card(kind === "guides" ? "guide" : "alternative", page.slug, {
          title: page.heading,
          description: page.description,
          label: kind === "guides" ? "Guide" : "Comparison",
          command: `beui.dev${seoPagePath(kind, page.slug)}`,
        }),
      ),
    ),
  ];
}

export function ogCardElement(
  card: Card,
  assets: { backgroundSrc: string; logoSrc: string },
): ReactElement {
  return ogImage({ ...card, ...assets });
}
