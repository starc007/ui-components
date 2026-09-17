import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  // Let Next.js handle segment prefetches to avoid repeated full-page RSC responses.
  // https://github.com/opennextjs/opennextjs-aws/issues/1212
  enableCacheInterception: false,
});

// Always refresh the public source snapshot, including builds invoked directly
// through the OpenNext CLI. Ordinary next dev continues reading live files.
config.buildCommand = "bun run prepare:cloudflare && BEUI_CLOUDFLARE=1 bun run build";

export default config;
