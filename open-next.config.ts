import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  // Serve prerendered pages without loading NextServer. OpenNext >= 1.20.7
  // includes the Next.js 16 segment-prefetch fix required for this fast path.
  enableCacheInterception: true,
});

// Always refresh the public source snapshot, including builds invoked directly
// through the OpenNext CLI. Ordinary next dev continues reading live files.
config.buildCommand = "bun run prepare:cloudflare && BEUI_CLOUDFLARE=1 bun run build";

export default config;
