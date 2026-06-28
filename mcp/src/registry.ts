// Thin typed client over the live beUI registry endpoints. The MCP server owns
// no data: it reads beui.dev/r/* at runtime so new components appear without a
// worker redeploy. Responses are cached at the edge for a short TTL.

export type IndexComponent = {
  slug: string;
  name: string;
  description: string;
  category: string;
  detail_url: string;
  raw_url: string;
  page_url: string;
};

export type RegistryIndex = {
  name: string;
  description: string;
  site: string;
  categories: { slug: string; name: string; description: string }[];
  components: IndexComponent[];
};

export type RegistryFile = {
  path: string;
  type: "component" | "preview" | "util";
  content: string;
};

export type RegistryEntry = {
  slug: string;
  name: string;
  description: string;
  category: string;
  detail_url: string;
  raw_url: string;
  page_url: string;
  dependencies: string[];
  internal: string[];
  files: RegistryFile[];
};

const TTL_SECONDS = 300;

async function fetchJson<T>(url: string): Promise<T> {
  const cache = caches.default;
  const cacheKey = new Request(url, { headers: { accept: "application/json" } });

  const cached = await cache.match(cacheKey);
  if (cached) return (await cached.json()) as T;

  const res = await fetch(cacheKey);
  if (!res.ok) {
    throw new Error(`Registry responded ${res.status} for ${url}`);
  }

  // Re-wrap so we control the cache header, then store a clone.
  const body = await res.text();
  const cacheable = new Response(body, {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${TTL_SECONDS}`,
    },
  });
  await cache.put(cacheKey, cacheable.clone());

  return JSON.parse(body) as T;
}

function base(env: { REGISTRY_URL?: string }) {
  return (env.REGISTRY_URL ?? "https://beui.dev").replace(/\/$/, "");
}

export function getIndex(env: { REGISTRY_URL?: string }) {
  return fetchJson<RegistryIndex>(`${base(env)}/r`);
}

export function getEntry(env: { REGISTRY_URL?: string }, slug: string) {
  return fetchJson<RegistryEntry>(`${base(env)}/r/${encodeURIComponent(slug)}`);
}

const PM_PREFIX = {
  bun: "bunx --bun",
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
} as const;

export type PackageManager = keyof typeof PM_PREFIX;
export const PACKAGE_MANAGERS = Object.keys(PM_PREFIX) as PackageManager[];

/** The shadcn install command for a component, using the public @beui namespace. */
export function installCommand(slug: string, pm: PackageManager) {
  return `${PM_PREFIX[pm]} shadcn add @beui/${slug}`;
}
