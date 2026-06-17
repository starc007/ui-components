// Components that moved from the motion category to blocks. Old page URLs
// stay alive; install slugs were never category-scoped so /r/* is untouched.
const MOVED_TO_BLOCKS = [
  "swap",
  "dynamic-island",
  "command-palette",
  "expandable-action-bar",
];

const OLD_SITE_HOST = "beui.saura3h.xyz";
const SITE_URL = "https://beui.dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: OLD_SITE_HOST }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
      ...MOVED_TO_BLOCKS.map((slug) => ({
        source: `/components/motion/${slug}`,
        destination: `/components/blocks/${slug}`,
        permanent: true,
      })),
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
