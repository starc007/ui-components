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
    slug: "primitives",
    name: "Primitives",
    description: "Core UI building blocks.",
    components: [
      { slug: "button", name: "Button", description: "Action triggers with variants, sizes, icons and loading state.", file: "components/ui/button.tsx" },
      { slug: "input", name: "Input", description: "Text input with label, hint, error and adornments.", file: "components/ui/input.tsx" },
      { slug: "textarea", name: "Textarea", description: "Auto-grow multiline input.", file: "components/ui/textarea.tsx" },
      { slug: "select", name: "Select", description: "Accessible listbox built on Headless UI.", file: "components/ui/select.tsx" },
      { slug: "checkbox", name: "Checkbox", description: "Animated check with indeterminate state.", file: "components/ui/checkbox.tsx" },
      { slug: "switch", name: "Switch", description: "Toggle with spring animation.", file: "components/ui/switch.tsx" },
      { slug: "dialog", name: "Dialog", description: "Modal dialog with backdrop blur.", file: "components/ui/dialog.tsx" },
      { slug: "drawer", name: "Drawer", description: "Side sheet with edge-aware animation.", file: "components/ui/drawer.tsx" },
      { slug: "tooltip", name: "Tooltip", description: "Hover/focus tooltip with delay.", file: "components/ui/tooltip.tsx" },
      { slug: "toast", name: "Toast", description: "Stacked notifications with auto-dismiss.", file: "components/ui/toast.tsx" },
      { slug: "tabs", name: "Tabs", description: "Animated tab indicator.", file: "components/ui/tabs.tsx" },
      { slug: "accordion", name: "Accordion", description: "Single or multi expand collapse.", file: "components/ui/accordion.tsx" },
      { slug: "badge", name: "Badge", description: "Status pill with variants.", file: "components/ui/badge.tsx" },
      { slug: "avatar", name: "Avatar", description: "Image avatar with fallback and group stack.", file: "components/ui/avatar.tsx" },
    ],
  },
  {
    slug: "motion",
    name: "Motion & Text",
    description: "Movement, reveals and text effects.",
    components: [
      { slug: "text-reveal", name: "Text Reveal", description: "Word-by-word mask reveal on scroll.", file: "components/motion/text-reveal.tsx" },
      { slug: "text-shimmer", name: "Text Shimmer", description: "Gradient sweep across text.", file: "components/motion/text-shimmer.tsx" },
      { slug: "marquee", name: "Marquee", description: "Infinite horizontal or vertical scroll.", file: "components/motion/marquee.tsx" },
      { slug: "magnetic", name: "Magnetic", description: "Cursor-attracted element with spring.", file: "components/motion/magnetic.tsx" },
      { slug: "tilt-card", name: "Tilt Card", description: "3D perspective tilt on hover.", file: "components/motion/tilt-card.tsx" },
      { slug: "animated-number", name: "Animated Number", description: "Spring-driven count up.", file: "components/motion/animated-number.tsx" },
    ],
  },
  {
    slug: "blocks",
    name: "Landing Blocks",
    description: "Sections for marketing pages.",
    components: [
      { slug: "hero", name: "Hero", description: "Above-the-fold with gradient + CTAs.", file: "components/blocks/hero.tsx" },
      { slug: "features", name: "Features", description: "Bento grid of feature cards.", file: "components/blocks/features.tsx" },
      { slug: "pricing", name: "Pricing", description: "Three-tier pricing table.", file: "components/blocks/pricing.tsx" },
      { slug: "testimonials", name: "Testimonials", description: "Marquee of social proof.", file: "components/blocks/testimonials.tsx" },
      { slug: "faq", name: "FAQ", description: "Accordion FAQ section.", file: "components/blocks/faq.tsx" },
      { slug: "cta", name: "CTA", description: "Closing call-to-action block.", file: "components/blocks/cta.tsx" },
      { slug: "footer", name: "Footer", description: "Site footer with link columns.", file: "components/blocks/footer.tsx" },
    ],
  },
  {
    slug: "data-nav",
    name: "Data & Nav",
    description: "Navigation and data display.",
    components: [
      { slug: "navbar", name: "Navbar", description: "Sticky blurred site navbar.", file: "components/data-nav/navbar.tsx" },
      { slug: "sidebar", name: "Sidebar", description: "Collapsible side navigation.", file: "components/data-nav/sidebar.tsx" },
      { slug: "stat-card", name: "Stat Card", description: "KPI card with trend.", file: "components/data-nav/stat-card.tsx" },
      { slug: "command-k", name: "Command Menu", description: "⌘K search palette.", file: "components/data-nav/command-k.tsx" },
      { slug: "breadcrumb", name: "Breadcrumb", description: "Hierarchical nav trail.", file: "components/data-nav/breadcrumb.tsx" },
      { slug: "data-table", name: "Data Table", description: "Sortable table with hover states.", file: "components/data-nav/data-table.tsx" },
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
