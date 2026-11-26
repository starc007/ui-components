// Thin typed client over the live beUI registry endpoints. The MCP server owns
// no data: it reads beui.dev/r/* at runtime so new components appear without a
// worker redeploy. Responses are cached at the edge for a short TTL.

export type IndexVariant = { slug: string; name: string; install_slug: string };

export type IndexComponent = {
  slug: string;
  name: string;
  description: string;
  category: string;
  /** Search aliases. Older index builds may omit it. */
  keywords?: string[];
  /** What `shadcn add @beui/<slug>` accepts for this page. */
  install_slugs?: string[];
  /** Installable variants of a page that splits into them. */
  variants?: IndexVariant[];
  detail_url: string;
  raw_url: string;
  page_url: string;
  markdown_url?: string;
};

export type RegistryIndex = {
  name: string;
  description: string;
  site: string;
  setup?: string;
  endpoints?: Record<string, string>;
  categories: { slug: string; name: string; description: string }[];
  components: IndexComponent[];
};

/** Every install slug, mapped to its page, from the index. */
export function installSlugs(index: RegistryIndex) {
  const slugs = new Map<string, IndexComponent>();
  for (const component of index.components) {
    for (const slug of component.install_slugs ?? [component.slug]) slugs.set(slug, component);
  }
  return slugs;
}

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

/** A component's Markdown docs (install, usage, props, types, guidance). */
export async function getMarkdown(env: { REGISTRY_URL?: string }, slug: string) {
  const url = `${base(env)}/r/${encodeURIComponent(slug)}.md`;
  const cache = caches.default;
  const cacheKey = new Request(url, { headers: { accept: "text/markdown" } });
  const cached = await cache.match(cacheKey);
  if (cached) return cached.text();
  const res = await fetch(cacheKey);
  if (!res.ok) throw new Error(`Registry responded ${res.status} for ${url}`);
  const body = await res.text();
  await cache.put(
    cacheKey,
    new Response(body, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "cache-control": `public, max-age=${TTL_SECONDS}`,
      },
    }),
  );
  return body;
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

// beUI Native, the React Native companion library, served from /native/r.

export type NativeIndexComponent = {
  slug: string;
  name: string;
  description: string;
  group: string;
  detail_url: string;
  page_url: string | null;
  expo_go_url: string;
};

export type NativeIndex = {
  name: string;
  description: string;
  version: string;
  repository: string;
  expo_go: { sdk: number; url: string; qr: string };
  setup: string[];
  components: NativeIndexComponent[];
};

export type NativeEntry = NativeIndexComponent & {
  source_url: string;
  libraries: string[];
  install: string[];
  setup: string[];
  files: { path: string; type: "component" | "shared" | "theme"; content: string }[];
};

export function getNativeIndex(env: { REGISTRY_URL?: string }) {
  return fetchJson<NativeIndex>(`${base(env)}/native/r`);
}

export function getNativeEntry(env: { REGISTRY_URL?: string }, slug: string) {
  return fetchJson<NativeEntry>(
    `${base(env)}/native/r/${encodeURIComponent(slug)}`,
  );
}
