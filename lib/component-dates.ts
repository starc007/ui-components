/**
 * Component publication and modification dates derived from git history.
 * Keep these dates in sync when a component's public docs or implementation
 * changes so sitemap and article freshness signals stay truthful. Site-wide
 * maintenance should not refresh every component's public update date.
 */
const COMPONENT_DATES = {
  "charts/line-chart": { publishedAt: "2026-10-27", updatedAt: "2026-11-05" },
  "charts/bar-chart": { publishedAt: "2026-10-27", updatedAt: "2026-11-05" },
  "charts/sparkline": { publishedAt: "2026-10-27", updatedAt: "2026-11-05" },
  "casino/crash": { publishedAt: "2026-11-05", updatedAt: "2026-11-05" },
  "casino/mines": { publishedAt: "2026-11-05", updatedAt: "2026-11-05" },
  "casino/plinko": { publishedAt: "2026-11-03", updatedAt: "2026-11-05" },
  "blocks/card-dealer": { publishedAt: "2026-10-24", updatedAt: "2026-11-05" },
  "charts/sankey-chart": { publishedAt: "2026-10-22", updatedAt: "2026-11-05" },
  "motion/timeline": { publishedAt: "2026-10-20", updatedAt: "2026-11-05" },
  "charts/donut-chart": { publishedAt: "2026-10-12", updatedAt: "2026-11-05" },
  "charts/candlestick-chart": { publishedAt: "2026-10-12", updatedAt: "2026-11-05" },
  "motion/card": { publishedAt: "2026-10-10", updatedAt: "2026-11-05" },
  "motion/color-picker": { publishedAt: "2026-10-10", updatedAt: "2026-11-05" },
  "charts/treemap": { publishedAt: "2026-10-07", updatedAt: "2026-11-05" },
  "charts/volume-profile": { publishedAt: "2026-10-07", updatedAt: "2026-11-05" },
  "charts/status-bar": { publishedAt: "2026-10-07", updatedAt: "2026-11-05" },
  "motion/alert": { publishedAt: "2026-10-05", updatedAt: "2026-11-05" },
  "motion/collapsible": { publishedAt: "2026-10-05", updatedAt: "2026-10-18" },
  "motion/aspect-ratio": { publishedAt: "2026-10-05", updatedAt: "2026-11-05" },
  "motion/arc-picker": { publishedAt: "2026-10-04", updatedAt: "2026-11-05" },
  "agents/voice-orb": { publishedAt: "2026-10-04", updatedAt: "2026-10-18" },
  "motion/sortable-stack": { publishedAt: "2026-10-02", updatedAt: "2026-11-05" },
  "motion/morphing-lightbox": { publishedAt: "2026-10-02", updatedAt: "2026-10-02" },
  "motion/image-viewer": { publishedAt: "2026-10-02", updatedAt: "2026-11-05" },
  "motion/date-range-picker": { publishedAt: "2026-10-02", updatedAt: "2026-11-05" },
  "motion/color-selector": { publishedAt: "2026-09-27", updatedAt: "2026-10-18" },
  "motion/pagination": { publishedAt: "2026-10-31", updatedAt: "2026-11-05" },
  "motion/avatar-group": { publishedAt: "2026-10-31", updatedAt: "2026-11-05" },
  "motion/breadcrumb": { publishedAt: "2026-09-27", updatedAt: "2026-11-05" },
  "motion/tilt-card": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/button": { publishedAt: "2026-05-17", updatedAt: "2026-11-05" },
  "motion/expandable-control": {
    publishedAt: "2026-08-22",
    updatedAt: "2026-10-18",
  },
  "motion/adaptive-stepper": {
    publishedAt: "2026-08-31",
    updatedAt: "2026-11-05",
  },
  "motion/expanding-arrow-button": {
    publishedAt: "2026-07-16",
    updatedAt: "2026-11-05",
  },
  "motion/marquee": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/tabs": { publishedAt: "2026-05-17", updatedAt: "2026-11-05" },
  "motion/switch": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/input": { publishedAt: "2026-06-29", updatedAt: "2026-10-18" },
  "motion/select": { publishedAt: "2026-06-28", updatedAt: "2026-10-18" },
  "motion/combobox": { publishedAt: "2026-08-11", updatedAt: "2026-11-05" },
  "motion/multi-select": { publishedAt: "2026-08-29", updatedAt: "2026-11-05" },
  "motion/checkbox": { publishedAt: "2026-06-23", updatedAt: "2026-11-05" },
  "motion/radio": { publishedAt: "2026-06-23", updatedAt: "2026-10-18" },
  "motion/bottom-sheet": { publishedAt: "2026-05-17", updatedAt: "2026-11-05" },
  "motion/pull-to-refresh": { publishedAt: "2026-07-17", updatedAt: "2026-11-05" },
  "motion/shared-layout-bg": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/bounce-sidebar": { publishedAt: "2026-07-22", updatedAt: "2026-11-05" },
  "motion/animated-sidebar": {
    publishedAt: "2026-07-29",
    updatedAt: "2026-11-05",
  },
  "motion/file-tree": { publishedAt: "2026-08-27", updatedAt: "2026-11-05" },
  "motion/preview-rail": { publishedAt: "2026-07-11", updatedAt: "2026-11-05" },
  "motion/dock": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/tooltip": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/context-menu": { publishedAt: "2026-07-27", updatedAt: "2026-11-05" },
  "motion/popover": { publishedAt: "2026-07-07", updatedAt: "2026-11-05" },
  "motion/morphing-modal": { publishedAt: "2026-05-17", updatedAt: "2026-11-05" },
  "motion/center-morph-modal": {
    publishedAt: "2026-07-21",
    updatedAt: "2026-11-05",
  },
  "motion/text-animation": { publishedAt: "2026-05-17", updatedAt: "2026-10-18" },
  "motion/number": { publishedAt: "2026-05-17", updatedAt: "2026-11-03" },
  "motion/animated-badge": { publishedAt: "2026-06-05", updatedAt: "2026-10-18" },
  "motion/action-swap": { publishedAt: "2026-06-10", updatedAt: "2026-10-18" },
  "motion/animated-toast-stack": { publishedAt: "2026-06-05", updatedAt: "2026-11-05" },
  "motion/theme-toggle": { publishedAt: "2026-06-15", updatedAt: "2026-11-05" },
  "motion/bouncy-accordion": { publishedAt: "2026-06-16", updatedAt: "2026-11-06" },
  "motion/drawer": { publishedAt: "2026-06-22", updatedAt: "2026-11-05" },
  "motion/scroll-animation": { publishedAt: "2026-06-24", updatedAt: "2026-10-18" },
  "motion/range-slider": { publishedAt: "2026-06-24", updatedAt: "2026-10-18" },
  "motion/wheel-picker": { publishedAt: "2026-07-09", updatedAt: "2026-11-05" },
  "motion/table": { publishedAt: "2026-07-01", updatedAt: "2026-11-05" },
  "motion/shader-background": { publishedAt: "2026-07-02", updatedAt: "2026-11-05" },
  "motion/cylinder-carousel": { publishedAt: "2026-07-04", updatedAt: "2026-11-05" },
  "motion/loader": { publishedAt: "2026-07-04", updatedAt: "2026-11-05" },
  "charts/composition-chart": { publishedAt: "2026-09-25", updatedAt: "2026-11-05" },
  "charts/funnel-chart": { publishedAt: "2026-09-20", updatedAt: "2026-11-05" },
  "charts/liquidity-heatmap": { publishedAt: "2026-09-20", updatedAt: "2026-11-05" },
  "charts/bump-chart": { publishedAt: "2026-09-20", updatedAt: "2026-11-05" },
  "charts/order-book": { publishedAt: "2026-09-19", updatedAt: "2026-11-05" },
  "charts/heat-calendar": { publishedAt: "2026-09-11", updatedAt: "2026-11-05" },
  "charts/returns-calendar": { publishedAt: "2026-09-11", updatedAt: "2026-11-05" },
  "charts/price-target-fan": { publishedAt: "2026-09-11", updatedAt: "2026-11-05" },
  "agents/loading-states": {
    publishedAt: "2026-07-30",
    updatedAt: "2026-11-05",
  },
  "agents/chat-app": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/message-bubble": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/message": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/message-scroller": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/ai-sidebar": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/approval-card": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/code-block": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/todo-list": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-03",
  },
  "agents/prompt-input": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/tool-result": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/file-diff": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/streaming-response": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/image-generation": {
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
  },
  "agents/tool-approval": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/citations": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "agents/agent-activity": {
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-05",
  },
  "blocks/infinite-masonry": { publishedAt: "2026-07-15", updatedAt: "2026-11-05" },
  "blocks/notification-stack": { publishedAt: "2026-07-14", updatedAt: "2026-11-05" },
  "blocks/project-folder": { publishedAt: "2026-08-15", updatedAt: "2026-11-05" },
  "blocks/card-folder": { publishedAt: "2026-09-04", updatedAt: "2026-11-05" },
  "blocks/knockout-bracket": { publishedAt: "2026-07-12", updatedAt: "2026-11-05" },
  "blocks/availability-scheduler": { publishedAt: "2026-07-10", updatedAt: "2026-11-05" },
  "blocks/swap": { publishedAt: "2026-05-19", updatedAt: "2026-11-05" },
  "blocks/dynamic-island": { publishedAt: "2026-06-10", updatedAt: "2026-11-05" },
  "blocks/command-palette": { publishedAt: "2026-05-17", updatedAt: "2026-11-05" },
  "blocks/morphing-search": { publishedAt: "2026-08-18", updatedAt: "2026-11-05" },
  "blocks/expandable-action-bar": { publishedAt: "2026-06-05", updatedAt: "2026-10-18" },
  "blocks/overflow-actions": { publishedAt: "2026-06-19", updatedAt: "2026-11-05" },
  "blocks/expandable-tabs": { publishedAt: "2026-06-14", updatedAt: "2026-11-05" },
  "blocks/morphing-tabs": { publishedAt: "2026-08-06", updatedAt: "2026-11-05" },
  "blocks/swipeable-list": { publishedAt: "2026-06-15", updatedAt: "2026-11-05" },
  "blocks/file-upload": { publishedAt: "2026-06-18", updatedAt: "2026-11-05" },
  "blocks/prediction-market": { publishedAt: "2026-06-18", updatedAt: "2026-11-05" },
  "blocks/wallet-card": { publishedAt: "2026-07-03", updatedAt: "2026-11-05" },
  "blocks/otp-input": { publishedAt: "2026-06-13", updatedAt: "2026-11-05" },
  "blocks/signup-form": { publishedAt: "2026-08-08", updatedAt: "2026-11-05" },
  "blocks/bloom-menu": { publishedAt: "2026-06-26", updatedAt: "2026-11-05" },
  "blocks/feedback-widget": { publishedAt: "2026-06-29", updatedAt: "2026-11-05" },
  "blocks/not-found": { publishedAt: "2026-06-21", updatedAt: "2026-11-05" },
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
