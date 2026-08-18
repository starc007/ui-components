export type ProRegistryFile = {
  path: string;
  type: string;
  target: string;
  content?: string;
};

export type ProRegistryItem = {
  name: string;
  type: "registry:block";
  title: string;
  description: string;
  author: string;
  dependencies: string[];
  registryDependencies: string[];
  files: ProRegistryFile[];
};

export type ProRegistryIndex = {
  name: string;
  homepage: string;
  items: Array<Omit<ProRegistryItem, "$schema">>;
};

export class ProRegistryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProRegistryError";
  }
}

function base(env: { PRO_REGISTRY_URL?: string }) {
  return (env.PRO_REGISTRY_URL ?? "https://pro.beui.dev").replace(/\/$/, "");
}

async function fetchJson<T>(url: string, authorization: string): Promise<T> {
  // Private source must never enter caches.default or a shared Worker cache.
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization,
    },
    cf: { cacheTtl: 0 },
  });

  if (!response.ok) {
    const message =
      response.status === 401
        ? "The beUI Pro token is invalid or expired."
        : response.status === 404
          ? "The requested beUI Pro component was not found."
          : `The beUI Pro registry responded with status ${response.status}.`;
    throw new ProRegistryError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getProIndex(
  env: { PRO_REGISTRY_URL?: string },
  authorization: string,
) {
  return fetchJson<ProRegistryIndex>(
    `${base(env)}/r/registry.json`,
    authorization,
  );
}

export function getProEntry(
  env: { PRO_REGISTRY_URL?: string },
  authorization: string,
  slug: string,
) {
  return fetchJson<ProRegistryItem>(
    `${base(env)}/r/${encodeURIComponent(slug)}.json`,
    authorization,
  );
}

const PM_PREFIX = {
  bun: "bunx --bun",
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
} as const;

export type ProPackageManager = keyof typeof PM_PREFIX;
export const PRO_PACKAGE_MANAGERS = Object.keys(
  PM_PREFIX,
) as ProPackageManager[];

export function proInstallCommand(slug: string, pm: ProPackageManager) {
  return `${PM_PREFIX[pm]} shadcn@latest add @beui-pro/${slug}`;
}

export const PRO_REGISTRY_SETUP = {
  "@beui": "https://beui.dev/r/{name}.json",
  "@beui-pro": {
    url: "https://pro.beui.dev/r/{name}.json",
    headers: {
      Authorization: "Bearer ${BEUI_PRO_TOKEN}",
    },
  },
} as const;
