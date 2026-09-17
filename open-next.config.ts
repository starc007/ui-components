import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  // Let Next.js handle segment prefetches to avoid repeated full-page RSC responses.
  // https://github.com/opennextjs/opennextjs-aws/issues/1212
  enableCacheInterception: false,
});

// Always refresh the public source snapshot, including builds invoked directly
// through the OpenNext CLI. Ordinary next dev continues reading live files.
config.buildCommand = "bun run prepare:cloudflare && BEUI_CLOUDFLARE=1 bun run build";

export default config;
