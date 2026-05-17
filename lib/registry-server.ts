import { promises as fs } from "node:fs";
import path from "node:path";
import { allComponents, findCategory, findComponent, registry } from "@/lib/registry";

const SITE_URL = "https://beui.saura3h.xyz";

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
  source_url: string;
  detail_url: string;
  raw_url: string;
  page_url: string;
  dependencies: string[];
  internal: string[];
  files: RegistryFile[];
};

const PKG_RE = /from\s+["']([^"']+)["']/g;

function parseDeps(source: string) {
  const external = new Set<string>();
  const internal = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = PKG_RE.exec(source))) {
    const spec = m[1];
    if (!spec) continue;
    if (spec.startsWith(".")) continue;
    if (spec.startsWith("@/")) {
      internal.add(spec);
      continue;
    }
    const pkg = spec.startsWith("@")
      ? spec.split("/").slice(0, 2).join("/")
      : spec.split("/")[0];
    if (pkg) external.add(pkg);
  }
  return {
    external: Array.from(external).sort(),
    internal: Array.from(internal).sort(),
  };
}

async function readFileSafe(rel: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(process.cwd(), rel), "utf8");
  } catch {
    return null;
  }
}

async function resolveInternal(spec: string): Promise<{ path: string; content: string } | null> {
  if (!spec.startsWith("@/")) return null;
  const rel = spec.replace(/^@\//, "");
  const candidates = [
    `${rel}.ts`,
    `${rel}.tsx`,
    `${rel}/index.ts`,
    `${rel}/index.tsx`,
    rel,
  ];
  for (const c of candidates) {
    const content = await readFileSafe(c);
    if (content != null) return { path: c, content };
  }
  return null;
}

export async function buildEntry(categorySlug: string, slug: string): Promise<RegistryEntry | null> {
  const cat = findCategory(categorySlug);
  const comp = findComponent(categorySlug, slug);
  if (!cat || !comp) return null;

  const componentSource = (await readFileSafe(comp.file)) ?? "";
  const previewPath = `components/previews/${categorySlug}/${slug}.preview.tsx`;
  const previewSource = await readFileSafe(previewPath);

  const compDeps = parseDeps(componentSource);
  const previewDeps = previewSource ? parseDeps(previewSource) : { external: [], internal: [] };

  const externalAll = Array.from(new Set([...compDeps.external, ...previewDeps.external])).sort();
  const internalAll = Array.from(new Set([...compDeps.internal, ...previewDeps.internal])).sort();

  const files: RegistryFile[] = [
    { path: comp.file, type: "component", content: componentSource },
  ];

  const allDepsInternal = new Set(compDeps.internal);
  if (comp.extraFiles) {
    for (const rel of comp.extraFiles) {
      const content = await readFileSafe(rel);
      if (content != null) {
        files.push({ path: rel, type: "component", content });
        for (const spec of parseDeps(content).internal) allDepsInternal.add(spec);
      }
    }
  }

  if (previewSource) {
    files.push({ path: previewPath, type: "preview", content: previewSource });
  }

  for (const spec of allDepsInternal) {
    const resolved = await resolveInternal(spec);
    if (resolved) {
      files.push({ path: resolved.path, type: "util", content: resolved.content });
    }
  }

  return {
    slug: comp.slug,
    name: comp.name,
    description: comp.description,
    category: cat.slug,
    source_url: `${SITE_URL}/r/${slug}/raw`,
    detail_url: `${SITE_URL}/r/${slug}`,
    raw_url: `${SITE_URL}/r/${slug}/raw`,
    page_url: `${SITE_URL}/components/${categorySlug}/${slug}`,
    dependencies: externalAll,
    internal: internalAll,
    files,
  };
}

export async function buildIndex() {
  return {
    name: "beUI v2",
    description: "Bespoke motion components for React. No Radix, no shadcn. Just motion.",
    site: SITE_URL,
    endpoints: {
      llms: `${SITE_URL}/llms.txt`,
      index: `${SITE_URL}/r`,
      detail: `${SITE_URL}/r/{slug}`,
      raw: `${SITE_URL}/r/{slug}/raw`,
    },
    categories: registry.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
    })),
    components: allComponents().map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      category: c.category.slug,
      detail_url: `${SITE_URL}/r/${c.slug}`,
      raw_url: `${SITE_URL}/r/${c.slug}/raw`,
      page_url: `${SITE_URL}/components/${c.category.slug}/${c.slug}`,
    })),
  };
}

export function findCategoryBySlug(slug: string) {
  return registry.find((c) => c.components.some((cc) => cc.slug === slug));
}
