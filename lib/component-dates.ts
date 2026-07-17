/**
 * Component publication and modification dates derived from git history.
 * Keep these dates in sync when a component's public docs or implementation
 * changes so sitemap and article freshness signals stay truthful.
 */
const COMPONENT_DATES = {
  "motion/tilt-card": { publishedAt: "2026-05-17", updatedAt: "2026-06-22" },
  "motion/button": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/marquee": { publishedAt: "2026-05-17", updatedAt: "2026-07-04" },
  "motion/tabs": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/switch": { publishedAt: "2026-05-17", updatedAt: "2026-06-10" },
  "motion/input": { publishedAt: "2026-06-29", updatedAt: "2026-07-05" },
  "motion/select": { publishedAt: "2026-06-28", updatedAt: "2026-07-13" },
  "motion/checkbox": { publishedAt: "2026-06-23", updatedAt: "2026-07-01" },
  "motion/radio": { publishedAt: "2026-06-23", updatedAt: "2026-07-13" },
  "motion/bottom-sheet": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/pull-to-refresh": { publishedAt: "2026-07-17", updatedAt: "2026-07-17" },
  "motion/shared-layout-bg": { publishedAt: "2026-05-17", updatedAt: "2026-06-22" },
  "motion/preview-rail": { publishedAt: "2026-07-11", updatedAt: "2026-07-11" },
  "motion/dock": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/tooltip": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/popover": { publishedAt: "2026-07-07", updatedAt: "2026-07-13" },
  "motion/morphing-modal": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "motion/text-animation": { publishedAt: "2026-05-17", updatedAt: "2026-06-28" },
  "motion/number": { publishedAt: "2026-05-17", updatedAt: "2026-06-28" },
  "motion/animated-badge": { publishedAt: "2026-06-05", updatedAt: "2026-06-10" },
  "motion/action-swap": { publishedAt: "2026-06-10", updatedAt: "2026-06-28" },
  "motion/animated-toast-stack": { publishedAt: "2026-06-05", updatedAt: "2026-07-13" },
  "motion/theme-toggle": { publishedAt: "2026-06-15", updatedAt: "2026-06-20" },
  "motion/bouncy-accordion": { publishedAt: "2026-06-16", updatedAt: "2026-07-13" },
  "motion/drawer": { publishedAt: "2026-06-22", updatedAt: "2026-06-22" },
  "motion/scroll-animation": { publishedAt: "2026-06-24", updatedAt: "2026-06-28" },
  "motion/range-slider": { publishedAt: "2026-06-24", updatedAt: "2026-06-24" },
  "motion/wheel-picker": { publishedAt: "2026-07-09", updatedAt: "2026-07-09" },
  "motion/table": { publishedAt: "2026-07-01", updatedAt: "2026-07-13" },
  "motion/shader-background": { publishedAt: "2026-07-02", updatedAt: "2026-07-13" },
  "motion/cylinder-carousel": { publishedAt: "2026-07-04", updatedAt: "2026-07-13" },
  "motion/loader": { publishedAt: "2026-07-04", updatedAt: "2026-07-13" },
  "blocks/infinite-masonry": { publishedAt: "2026-07-15", updatedAt: "2026-07-15" },
  "blocks/notification-stack": { publishedAt: "2026-07-14", updatedAt: "2026-07-14" },
  "blocks/knockout-bracket": { publishedAt: "2026-07-12", updatedAt: "2026-07-12" },
  "blocks/availability-scheduler": { publishedAt: "2026-07-10", updatedAt: "2026-07-10" },
  "blocks/swap": { publishedAt: "2026-05-19", updatedAt: "2026-06-13" },
  "blocks/dynamic-island": { publishedAt: "2026-06-10", updatedAt: "2026-07-13" },
  "blocks/command-palette": { publishedAt: "2026-05-17", updatedAt: "2026-07-13" },
  "blocks/expandable-action-bar": { publishedAt: "2026-06-05", updatedAt: "2026-06-22" },
  "blocks/overflow-actions": { publishedAt: "2026-06-19", updatedAt: "2026-06-28" },
  "blocks/expandable-tabs": { publishedAt: "2026-06-14", updatedAt: "2026-06-28" },
  "blocks/swipeable-list": { publishedAt: "2026-06-15", updatedAt: "2026-06-28" },
  "blocks/file-upload": { publishedAt: "2026-06-18", updatedAt: "2026-06-21" },
  "blocks/prediction-market": { publishedAt: "2026-06-18", updatedAt: "2026-06-21" },
  "blocks/wallet-card": { publishedAt: "2026-07-03", updatedAt: "2026-07-03" },
  "blocks/otp-input": { publishedAt: "2026-06-13", updatedAt: "2026-07-13" },
  "blocks/bloom-menu": { publishedAt: "2026-06-26", updatedAt: "2026-06-26" },
  "blocks/feedback-widget": { publishedAt: "2026-06-29", updatedAt: "2026-07-13" },
  "blocks/not-found": { publishedAt: "2026-06-21", updatedAt: "2026-06-21" },
} as const;

export type ComponentDates = {
  publishedAt: string;
  updatedAt: string;
};

export function componentDates(category: string, slug: string): ComponentDates {
  const dates = COMPONENT_DATES[`${category}/${slug}` as keyof typeof COMPONENT_DATES];
  if (!dates) {
    throw new Error(`Missing component dates for ${category}/${slug}`);
  }
  return dates;
}
