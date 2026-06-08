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

type ShadcnFileType = "registry:component" | "registry:hook" | "registry:lib";

export type ShadcnRegistryFile = {
  path: string;
  type: ShadcnFileType;
  target: string;
  content?: string;
};

export type ShadcnRegistryCss = Record<string, Record<string, string>>;

export type ShadcnRegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  author: string;
  dependencies: string[];
  registryDependencies: string[];
  css: ShadcnRegistryCss;
  docs: string;
  files: ShadcnRegistryFile[];
};

export type ShadcnRegistry = {
  $schema: "https://ui.shadcn.com/schema/registry.json";
  name: string;
  homepage: string;
  items: Array<Omit<ShadcnRegistryItem, "$schema">>;
};

const PKG_RE = /from\s+["']([^"']+)["']/g;
const SHADCN_DEP_SKIP = new Set(["next", "react", "react-dom"]);

const BEUI_CSS: ShadcnRegistryCss = {
  ":root": {
    "--color-bg": "var(--background)",
    "--color-bg-elev": "var(--card)",
    "--color-fg": "var(--foreground)",
    "--color-fg-muted": "var(--muted-foreground)",
    "--color-border": "var(--border)",
    "--color-border-strong": "color-mix(in oklch, var(--border) 72%, var(--foreground) 28%)",
    "--color-accent": "var(--primary)",
    "--color-accent-fg": "var(--primary-foreground)",
    "--color-neon": "oklch(0.8 0.22 145)",
    "--color-violet": "oklch(0.68 0.22 295)",
    "--color-danger": "var(--destructive)",
    "--color-success": "oklch(0.7 0.18 155)",
    "--color-warning": "oklch(0.78 0.18 75)",
  },
  ".dark": {
    "--color-bg": "var(--background)",
    "--color-bg-elev": "var(--card)",
    "--color-fg": "var(--foreground)",
    "--color-fg-muted": "var(--muted-foreground)",
    "--color-border": "var(--border)",
    "--color-border-strong": "color-mix(in oklch, var(--border) 68%, var(--foreground) 32%)",
    "--color-accent": "var(--primary)",
    "--color-accent-fg": "var(--primary-foreground)",
    "--color-neon": "oklch(0.8 0.22 145)",
    "--color-violet": "oklch(0.68 0.22 295)",
    "--color-danger": "var(--destructive)",
    "--color-success": "oklch(0.72 0.18 155)",
    "--color-warning": "oklch(0.8 0.18 75)",
  },
};

const BEUI_REGISTRY_DOCS =
  "beUI components use a small token bridge that maps beUI variables like --color-fg and --color-bg-elev to your shadcn theme tokens. The shadcn CLI installs these variables into your configured CSS file, so the component follows your app theme while preserving the original motion styling.";

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

function fileTypeForPath(rel: string): ShadcnFileType {
  if (rel.startsWith("lib/hooks/")) return "registry:hook";
  if (rel.startsWith("lib/")) return "registry:lib";
  return "registry:component";
}

function targetForPath(rel: string) {
  if (rel.startsWith("components/")) {
    return `@components/${rel.replace(/^components\//, "")}`;
  }

  if (rel.startsWith("lib/")) {
    return `@lib/${rel.replace(/^lib\//, "")}`;
  }

  return `~/${rel}`;
}

function shadcnFile(rel: string, content?: string): ShadcnRegistryFile {
  return {
    path: rel,
    type: fileTypeForPath(rel),
    target: targetForPath(rel),
    ...(content !== undefined ? { content } : {}),
  };
}

function uniqueByPath(files: ShadcnRegistryFile[]) {
  const seen = new Set<string>();
  return files.filter((file) => {
    if (seen.has(file.path)) return false;
    seen.add(file.path);
    return true;
  });
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

export async function buildShadcnItem(
  categorySlug: string,
  slug: string,
  { includeContent = true }: { includeContent?: boolean } = {},
): Promise<ShadcnRegistryItem | null> {
  const comp = findComponent(categorySlug, slug);
  if (!comp) return null;

  const files: ShadcnRegistryFile[] = [];
  const dependencies = new Set<string>();
  const internalQueue: string[] = [];
  const internalSeen = new Set<string>();

  async function addSource(rel: string) {
    const content = await readFileSafe(rel);
    if (content == null) return;

    files.push(shadcnFile(rel, includeContent ? content : undefined));
    const deps = parseDeps(content);
    for (const dep of deps.external) {
      if (!SHADCN_DEP_SKIP.has(dep)) dependencies.add(dep);
    }
    for (const spec of deps.internal) internalQueue.push(spec);
  }

  await addSource(comp.file);

  if (comp.extraFiles) {
    for (const rel of comp.extraFiles) {
      await addSource(rel);
    }
  }

  while (internalQueue.length > 0) {
    const spec = internalQueue.shift();
    if (!spec || internalSeen.has(spec)) continue;
    internalSeen.add(spec);

    const resolved = await resolveInternal(spec);
    if (!resolved) continue;

    await addSource(resolved.path);
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: comp.slug,
    type: "registry:component",
    title: comp.name,
    description: comp.description,
    author: "Saurabh <saurabh10102@gmail.com>",
    dependencies: Array.from(dependencies).sort(),
    registryDependencies: [],
    css: BEUI_CSS,
    docs: BEUI_REGISTRY_DOCS,
    files: uniqueByPath(files),
  };
}

export async function buildShadcnRegistry(): Promise<ShadcnRegistry> {
  const items = await Promise.all(
    allComponents().map(async (component) => {
      const item = await buildShadcnItem(component.category.slug, component.slug, { includeContent: false });
      if (!item) return null;
      const { $schema: _schema, ...entry } = item;
      return entry;
    }),
  );

  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "beui",
    homepage: SITE_URL,
    items: items.filter((item): item is Omit<ShadcnRegistryItem, "$schema"> => item !== null),
  };
}

export async function buildIndex() {
  return {
    name: "beUI v2",
    description: "Bespoke motion components for React.",
    site: SITE_URL,
    endpoints: {
      llms: `${SITE_URL}/llms.txt`,
      index: `${SITE_URL}/r`,
      shadcn_registry: `${SITE_URL}/r/registry.json`,
      shadcn_item: `${SITE_URL}/r/{slug}.json`,
      directory_registry: `${SITE_URL}/registry.json`,
      directory_item: `${SITE_URL}/{slug}.json`,
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
