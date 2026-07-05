// Block source files still live under components/motion. Keep inferred and
// historical motion-category URLs pointed at their public block docs pages.
const BLOCK_COMPONENTS = [
  "swap",
  "dynamic-island",
  "command-palette",
  "expandable-action-bar",
  "overflow-actions",
  "expandable-tabs",
  "swipeable-list",
  "file-upload",
  "prediction-market",
  "wallet-card",
  "otp-input",
  "bloom-menu",
  "feedback-widget",
  "not-found",
];

// Old variant and source-file URLs surfaced by crawlers before the catalog was
// consolidated. Send them to the component page that owns the implementation.
const LEGACY_COMPONENT_REDIRECTS = [
  ["/components/motion/base", "/components/motion/button"],
  ["/components/motion/button-base", "/components/motion/button"],
  ["/components/motion/stateful", "/components/motion/button"],
  ["/components/motion/button-stateful", "/components/motion/button"],
  ["/components/motion/magnetic", "/components/motion/button"],
  ["/components/motion/button-magnetic", "/components/motion/button"],
  ["/components/motion/select-morph", "/components/motion/select"],
  ["/components/motion/text-reveal", "/components/motion/text-animation"],
  ["/components/motion/text-shimmer", "/components/motion/text-animation"],
  ["/components/motion/text-cascade", "/components/motion/text-animation"],
  ["/components/motion/number-ticker", "/components/motion/number"],
  ["/components/motion/animated-number", "/components/motion/number"],
  ["/components/motion/action-swap-cascade", "/components/motion/action-swap"],
  ["/components/motion/action-swap-blur", "/components/motion/action-swap"],
  ["/components/motion/action-swap-roll", "/components/motion/action-swap"],
  ["/components/motion/smooth-scroll", "/components/motion/scroll-animation"],
  ["/components/motion/scroll-progress", "/components/motion/scroll-animation"],
  ["/components/motion/parallax", "/components/motion/scroll-animation"],
  ["/components/motion/scroll-to", "/components/motion/scroll-animation"],
  ["/components/motion/scroll-reveal", "/components/motion/scroll-animation"],
  ["/components/motion/table-editable", "/components/motion/table"],
  ["/components/motion/table-async", "/components/motion/table"],
  ["/components/motion/editable-cell", "/components/motion/table"],
  ["/components/motion/row-handle", "/components/motion/table"],
  ["/components/motion/skeleton-rows", "/components/motion/table"],
  ["/components/motion/table-header", "/components/motion/table"],
  ["/components/motion/table-menu", "/components/motion/table"],
  ["/components/motion/use-column-reorder", "/components/motion/table"],
  ["/components/motion/use-column-resize", "/components/motion/table"],
  ["/components/motion/use-column-sort", "/components/motion/table"],
  ["/components/motion/use-row-selection", "/components/motion/table"],
  ["/components/motion/create-menu", "/components/blocks/bloom-menu"],
  ["/components/blocks/create-menu", "/components/blocks/bloom-menu"],
  ["/components/blocks/constants", "/components/blocks/swap"],
  ["/components/blocks/controls", "/components/blocks/swap"],
  ["/components/blocks/data", "/components/blocks/swap"],
  ["/components/blocks/field", "/components/blocks/swap"],
  ["/components/blocks/quote-row", "/components/blocks/swap"],
  ["/components/blocks/token-badges", "/components/blocks/swap"],
  ["/components/blocks/token-picker", "/components/blocks/swap"],
  ["/components/blocks/account-avatar", "/components/blocks/wallet-card"],
  ["/components/blocks/account-switcher", "/components/blocks/wallet-card"],
  ["/components/blocks/actions", "/components/blocks/wallet-card"],
  ["/components/blocks/balance-delta", "/components/blocks/wallet-card"],
  ["/components/blocks/copy-button", "/components/blocks/wallet-card"],
  ["/components/blocks/search-bar", "/components/blocks/wallet-card"],
  ["/components/blocks/use-dismiss", "/components/blocks/wallet-card"],
  ["/components/blocks/glitch", "/components/blocks/not-found"],
  ["/components/blocks/not-found-glitch", "/components/blocks/not-found"],
  ["/components/blocks/magnetic", "/components/blocks/not-found"],
  ["/components/blocks/not-found-magnetic", "/components/blocks/not-found"],
  ["/components/blocks/spotlight", "/components/blocks/not-found"],
  ["/components/blocks/not-found-spotlight", "/components/blocks/not-found"],
  ["/components/blocks/stacked", "/components/blocks/not-found"],
  ["/components/blocks/not-found-stacked", "/components/blocks/not-found"],
  ["/components/blocks/terminal", "/components/blocks/not-found"],
  ["/components/blocks/not-found-terminal", "/components/blocks/not-found"],
  ["/components/blocks/shared", "/components/blocks/not-found"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      ...BLOCK_COMPONENTS.map((slug) => ({
        source: `/components/motion/${slug}`,
        destination: `/components/blocks/${slug}`,
        permanent: true,
      })),
      ...["swap", "wallet-card", "not-found"].map((slug) => ({
        source: `/components/motion/${slug}/:internal(.+)`,
        destination: `/components/blocks/${slug}`,
        permanent: true,
      })),
      ...LEGACY_COMPONENT_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      {
        source: "/components/:category/:slug/:internal(.+)",
        destination: "/components/:category/:slug",
        permanent: true,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/components/*": [
      "./components/motion/**/*",
      "./components/previews/**/*",
    ],
    "/r/*": [
      "./components/motion/**/*",
      "./components/previews/**/*",
      "./lib/**/*",
    ],
    "/*": [
      "./components/motion/**/*",
      "./lib/**/*",
    ],
  },
};

export default nextConfig;
