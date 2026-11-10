import languages from "@/i18n/languages.json";

const CHART_COMPONENTS = ["heat-calendar", "returns-calendar", "price-target-fan"];

// Block source files still live under components/motion. Keep inferred and
// historical motion-category URLs pointed at their public block docs pages.
const BLOCK_COMPONENTS = [
  "infinite-masonry",
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
  ["/components/motion/morphing-lightbox", "/components/motion/image-viewer"],
  ["/components/motion/morphing-lightbox.md", "/components/motion/image-viewer.md"],
  ["/components/motion/lightbox", "/components/motion/image-viewer"],
  ["/components/motion/lightbox.md", "/components/motion/image-viewer.md"],
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

type Redirect = { source: string; destination: string };

/**
 * Cloudflare `_redirects` syntax: `*` is a splat (`:splat` in the target) and
 * `:name` matches one path segment. All are permanent (301).
 */
const REDIRECTS: Redirect[] = [
  { source: "/favicon.ico", destination: "/beui-mark.png" },
  { source: "/pro", destination: "https://pro.beui.dev" },
  { source: "/components", destination: "/components/motion" },
  { source: "/components/charts", destination: "/charts" },
  { source: "/components/charts/*", destination: "/charts/:splat" },
  ...CHART_COMPONENTS.flatMap((slug) =>
    ["", ".md"].map((extension) => ({
      source: `/components/motion/${slug}${extension}`,
      destination: `/charts/${slug}${extension}`,
    })),
  ),
  { source: "/components/casino", destination: "/casino" },
  { source: "/components/casino/*", destination: "/casino/:splat" },
  // Casino games shipped under Blocks before they got their own section,
  // and their source still lives in components/motion.
  ...["crash", "mines", "plinko"].flatMap((slug) =>
    ["blocks", "motion"].flatMap((category) =>
      ["", ".md"].map((extension) => ({
        source: `/components/${category}/${slug}${extension}`,
        destination: `/casino/${slug}${extension}`,
      })),
    ),
  ),
  ...BLOCK_COMPONENTS.map((slug) => ({
    source: `/components/motion/${slug}`,
    destination: `/components/blocks/${slug}`,
  })),
  ...["swap", "wallet-card", "not-found"].map((slug) => ({
    source: `/components/motion/${slug}/*`,
    destination: `/components/blocks/${slug}`,
  })),
  ...LEGACY_COMPONENT_REDIRECTS.map(([source, destination]) => ({ source, destination })),
  { source: "/components/:category/:slug/*", destination: "/components/:category/:slug" },
];

/** The `_redirects` file, written by scripts/build-static.ts. */
export function redirectsFile() {
  const prefixes = Object.keys(languages).filter((locale) => locale !== "en");
  const all = [
    ...REDIRECTS,
    // Same redirects inside each language prefix (/de/components/motion/swap).
    // Markdown, the favicon and external targets stay unprefixed.
    ...prefixes.flatMap((locale) =>
      REDIRECTS.filter(
        (redirect) =>
          redirect.destination.startsWith("/") &&
          !redirect.destination.endsWith(".md") &&
          redirect.source !== "/favicon.ico",
      ).map((redirect) => ({
        source: `/${locale}${redirect.source}`,
        destination: `/${locale}${redirect.destination}`,
      })),
    ),
  ];
  // Cloudflare reads static rules before dynamic ones regardless of order,
  // but list them that way so the file reads the way it runs.
  const isDynamic = (redirect: Redirect) => /[*:]/.test(redirect.source);
  return [...all.filter((r) => !isDynamic(r)), ...all.filter(isDynamic)]
    .map((redirect) => `${redirect.source} ${redirect.destination} 301`)
    .join("\n")
    .concat("\n");
}
