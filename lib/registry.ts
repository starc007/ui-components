export type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  file: string;
};

export type CategoryEntry = {
  slug: string;
  name: string;
  description: string;
  components: ComponentEntry[];
};

export const registry: CategoryEntry[] = [
  {
    slug: "motion",
    name: "Motion",
    description: "A curated set of bespoke motion components. No Radix, no shadcn. Just motion.",
    components: [
      {
        slug: "tilt-card",
        name: "Tilt Card",
        description: "3D perspective tilt on hover with cursor-tracked glare.",
        file: "components/motion/tilt-card.tsx",
      },
      {
        slug: "magnetic",
        name: "Magnetic",
        description: "Cursor-attracted element with spring physics.",
        file: "components/motion/magnetic.tsx",
      },
      {
        slug: "marquee",
        name: "Marquee",
        description: "Infinite horizontal or vertical scroll with pause-on-hover.",
        file: "components/motion/marquee.tsx",
      },
      {
        slug: "tabs",
        name: "Tabs",
        description: "Pill, segment or underline tabs with a spring layoutId indicator.",
        file: "components/motion/tabs.tsx",
      },
      {
        slug: "switch",
        name: "Switch",
        description: "Toggle with a spring-driven thumb and press feedback.",
        file: "components/motion/switch.tsx",
      },
      {
        slug: "bottom-sheet",
        name: "Bottom Sheet",
        description: "Vaul-inspired draggable bottom sheet with snap points, inertia and glass surface.",
        file: "components/motion/bottom-sheet.tsx",
      },
      {
        slug: "command-palette",
        name: "Command Palette",
        description: "⌘K palette with fuzzy filter, spring-animated active row and glass surface.",
        file: "components/motion/command-palette.tsx",
      },
      {
        slug: "shared-layout-bg",
        name: "Shared Layout Background",
        description: "A pill that glides between hovered items via motion's shared layout, with blur enter/exit.",
        file: "components/motion/shared-layout-bg.tsx",
      },
      {
        slug: "dock",
        name: "Dock",
        description: "macOS-style dock with cursor-proximity magnification on each item.",
        file: "components/motion/dock.tsx",
      },
      {
        slug: "tooltip",
        name: "Tooltip",
        description: "Hover or focus tooltip with blur enter/exit and spring spawn.",
        file: "components/motion/tooltip.tsx",
      },
      {
        slug: "morphing-modal",
        name: "Morphing Modal",
        description: "Family-app-style modal. A single panel that morphs its height as you navigate between inner views, with blur cross-fade on content.",
        file: "components/motion/morphing-modal.tsx",
      },
      {
        slug: "text-reveal",
        name: "Text Reveal",
        description: "Word or character reveal with spring slide-up and blur.",
        file: "components/motion/text-reveal.tsx",
      },
      {
        slug: "text-shimmer",
        name: "Text Shimmer",
        description: "Gradient sweep across text for loading or emphasis.",
        file: "components/motion/text-shimmer.tsx",
      },
      {
        slug: "animated-number",
        name: "Animated Number",
        description: "Spring-driven count-up triggered when in view.",
        file: "components/motion/animated-number.tsx",
      },
      {
        slug: "number-ticker",
        name: "Number Ticker",
        description: "Slot-machine rolling digits with staggered entry.",
        file: "components/motion/number-ticker.tsx",
      },
    ],
  },
];

export function findCategory(slug: string) {
  return registry.find((c) => c.slug === slug);
}

export function findComponent(categorySlug: string, slug: string) {
  return findCategory(categorySlug)?.components.find((c) => c.slug === slug);
}

export function allComponents() {
  return registry.flatMap((c) =>
    c.components.map((comp) => ({ ...comp, category: c }))
  );
}
