export type ComponentExample = {
  slug: string;
  name: string;
  description?: string;
  /** Optional install slug for variants that have their own registry command. */
  installSlug?: string;
  /** Source file shown under Source tab. */
  file: string;
  /** Key into the previews registry (e.g. "motion/button-base"). */
  previewKey: string;
  /** Path to the preview file used for the Usage tab. */
  previewFile: string;
};

export type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  file: string;
  /** Extra source files bundled under this slug (e.g. multi-file components). */
  extraFiles?: string[];
  /** Per-variant breakdown rendered as separate Preview / Usage / Source on the page. */
  examples?: ComponentExample[];
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
    name: "Components",
    description: "Bespoke motion primitives with shadcn-compatible registry endpoints.",
    components: [
      {
        slug: "tilt-card",
        name: "Tilt Card",
        description: "3D perspective tilt on hover with cursor-tracked glare.",
        file: "components/motion/tilt-card.tsx",
      },
      {
        slug: "button",
        name: "Button",
        description: "Spring-pressed Button plus StatefulButton (idle → loading → success / error) and MagneticButton.",
        file: "components/motion/button/index.tsx",
        extraFiles: [
          "components/motion/button/base.tsx",
          "components/motion/button/stateful.tsx",
          "components/motion/button/magnetic.tsx",
        ],
        examples: [
          {
            slug: "base",
            name: "Button",
            description: "Press scale, hover lift, variants and sizes.",
            installSlug: "button-base",
            file: "components/motion/button/base.tsx",
            previewKey: "motion/button-base",
            previewFile: "components/previews/motion/button-base.preview.tsx",
          },
          {
            slug: "stateful",
            name: "Stateful Button",
            description: "Idle → loading → success / error with blur-swap slots and morphing width.",
            installSlug: "button-stateful",
            file: "components/motion/button/stateful.tsx",
            previewKey: "motion/button-stateful",
            previewFile: "components/previews/motion/button-stateful.preview.tsx",
          },
          {
            slug: "magnetic",
            name: "Magnetic Button",
            description: "Button composed with the Magnetic wrapper for cursor-attracted pull.",
            installSlug: "button-magnetic",
            file: "components/motion/button/magnetic.tsx",
            previewKey: "motion/button-magnetic",
            previewFile: "components/previews/motion/button-magnetic.preview.tsx",
          },
        ],
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
        slug: "shared-layout-bg",
        name: "Shared Layout Background",
        description: "A pill that glides between hovered items via motion's shared layout, with blur enter/exit.",
        file: "components/motion/shared-layout-bg.tsx",
      },
      {
        slug: "dock",
        name: "Dock",
        description: "macOS-style dock with grouped actions and a gliding active pill.",
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
        slug: "text-animation",
        name: "Text Animation",
        description: "Animated text primitives for reveal sequences, shimmer loading states and letter-cascade swaps.",
        file: "components/motion/text-reveal.tsx",
        extraFiles: [
          "components/motion/text-shimmer.tsx",
          "components/motion/text-cascade.tsx",
        ],
        examples: [
          {
            slug: "reveal",
            name: "Text Reveal",
            description: "Word or character reveal with spring slide-up and blur.",
            installSlug: "text-reveal",
            file: "components/motion/text-reveal.tsx",
            previewKey: "motion/text-reveal",
            previewFile: "components/previews/motion/text-reveal.preview.tsx",
          },
          {
            slug: "shimmer",
            name: "Text Shimmer",
            description: "Gradient sweep across text for loading or emphasis.",
            installSlug: "text-shimmer",
            file: "components/motion/text-shimmer.tsx",
            previewKey: "motion/text-shimmer",
            previewFile: "components/previews/motion/text-shimmer.preview.tsx",
          },
          {
            slug: "cascade",
            name: "Text Cascade",
            description: "Letter-by-letter slot roll for standalone text — old letters drop away as new ones land, left to right.",
            installSlug: "text-cascade",
            file: "components/motion/text-cascade.tsx",
            previewKey: "motion/text-cascade",
            previewFile: "components/previews/motion/text-cascade.preview.tsx",
          },
        ],
      },
      {
        slug: "number",
        name: "Number Animation",
        description: "Animated number primitives for count-up values and rolling digit tickers.",
        file: "components/motion/animated-number.tsx",
        extraFiles: ["components/motion/number-ticker.tsx"],
        examples: [
          {
            slug: "ticker",
            name: "Number Ticker",
            description: "Slot-machine rolling digits with staggered entry.",
            installSlug: "number-ticker",
            file: "components/motion/number-ticker.tsx",
            previewKey: "motion/number-ticker",
            previewFile: "components/previews/motion/number-ticker.preview.tsx",
          },
          {
            slug: "animated",
            name: "Animated Number",
            description: "Spring-driven count-up triggered when in view.",
            installSlug: "animated-number",
            file: "components/motion/animated-number.tsx",
            previewKey: "motion/animated-number",
            previewFile: "components/previews/motion/animated-number.preview.tsx",
          },
        ],
      },
      {
        slug: "animated-badge",
        name: "Animated Badge",
        description: "Status badge with animated state icons, pulse feedback and compact size variants.",
        file: "components/motion/animated-badge.tsx",
      },
      {
        slug: "action-swap",
        name: "Action Swap",
        description: "CTA button and slot primitives for swapping text and icons with blur motion.",
        file: "components/motion/action-swap.tsx",
        examples: [
          {
            slug: "cascade",
            name: "Cascade",
            description: "Letter-by-letter slot roll — the old label's letters drop away as the new ones land, left to right.",
            installSlug: "action-swap-cascade",
            file: "components/motion/action-swap-cascade.tsx",
            previewKey: "motion/action-swap-cascade",
            previewFile: "components/previews/motion/action-swap-cascade.preview.tsx",
          },
          {
            slug: "blur",
            name: "Blur",
            description: "Copy-button style swap with blur, opacity and scale.",
            installSlug: "action-swap-blur",
            file: "components/motion/action-swap-blur.tsx",
            previewKey: "motion/action-swap-blur",
            previewFile: "components/previews/motion/action-swap-blur.preview.tsx",
          },
          {
            slug: "roll",
            name: "Roll",
            description: "The next text or icon rolls in from below with blur.",
            installSlug: "action-swap-roll",
            file: "components/motion/action-swap-roll.tsx",
            previewKey: "motion/action-swap-roll",
            previewFile: "components/previews/motion/action-swap-roll.preview.tsx",
          },
        ],
      },
      {
        slug: "animated-toast-stack",
        name: "Animated Toast Stack",
        description: "Stacked toasts with status morphs, swipe dismissal, actions and layout-aware motion.",
        file: "components/motion/animated-toast-stack.tsx",
      },
    ],
  },
  {
    slug: "blocks",
    name: "Blocks",
    description: "Composed, product-ready widgets built from beUI motion primitives.",
    components: [
      {
        slug: "swap",
        name: "Multi-chain Swap",
        description: "Cross-chain swap widget with chain + token selectors, morphing views, animated flip and quote.",
        file: "components/motion/swap.tsx",
      },
      {
        slug: "dynamic-island",
        name: "Dynamic Island",
        description: "iOS-style island pill that morphs between live activity views with bouncy shell resize and blur crossfades.",
        file: "components/motion/dynamic-island.tsx",
      },
      {
        slug: "command-palette",
        name: "Command Palette",
        description: "⌘K palette with fuzzy filter, spring-animated active row and glass surface.",
        file: "components/motion/command-palette.tsx",
      },
      {
        slug: "expandable-action-bar",
        name: "Expandable Action Bar",
        description: "Compact icon actions that expand into labeled controls on hover or focus with shared layout motion.",
        file: "components/motion/expandable-action-bar.tsx",
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
