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
    description: "A curated set of motion components built on top of shadcn primitives.",
    components: [
      {
        slug: "spotlight-card",
        name: "Spotlight Card",
        description: "Cursor-follow radial glow plus an animated gradient border.",
        file: "components/motion/spotlight-card.tsx",
      },
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
        slug: "text-reveal",
        name: "Text Reveal",
        description: "Word-by-word mask reveal driven by scroll progress.",
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
      {
        slug: "bottom-sheet",
        name: "Bottom Sheet",
        description: "Vaul-inspired draggable bottom sheet with snap points and inertia.",
        file: "components/motion/bottom-sheet.tsx",
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
