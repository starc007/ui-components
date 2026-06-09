import { allComponents, findCategory, findComponent, registry } from "@/lib/registry";
import { readOptionalSourceFile, readSourceFile, resolveSourceImport, type SourceFile } from "@/lib/source-files";

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

export type ShadcnRegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  author: string;
  dependencies: string[];
  registryDependencies: string[];
  files: ShadcnRegistryFile[];
};

export type ShadcnRegistry = {
  $schema: "https://ui.shadcn.com/schema/registry.json";
  name: string;
  homepage: string;
  items: Array<Omit<ShadcnRegistryItem, "$schema">>;
};

const STATIC_IMPORT_RE = /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const SHADCN_DEP_SKIP = new Set(["next", "react", "react-dom"]);

function parseDeps(source: string) {
  const external = new Set<string>();
  const internal = new Set<string>();
  const specs = new Set<string>();

  for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(source))) {
      const spec = m[1];
      if (spec) specs.add(spec);
    }
  }

  for (const spec of specs) {
    if (!spec) continue;
    if (spec.startsWith("@/") || spec.startsWith(".")) {
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

type CollectedSourceGraph = {
  files: SourceFile[];
  external: string[];
  internal: string[];
};

async function collectSourceGraph(initialFiles: string[]): Promise<CollectedSourceGraph> {
  const files: SourceFile[] = [];
  const queued = [...initialFiles];
  const seen = new Set<string>();
  const external = new Set<string>();
  const internal = new Set<string>();

  while (queued.length > 0) {
    const rel = queued.shift();
    if (!rel || seen.has(rel)) continue;
    seen.add(rel);

    const content = await readSourceFile(rel);
    files.push({ path: rel, content });

    const deps = parseDeps(content);
    for (const dep of deps.external) external.add(dep);

    for (const spec of deps.internal) {
      internal.add(spec);
      const resolved = await resolveSourceImport(spec, rel);
      if (!resolved) {
        throw new Error(`Cannot resolve internal import "${spec}" from ${rel}`);
      }
      if (!seen.has(resolved.path)) queued.push(resolved.path);
    }
  }

  return {
    files,
    external: Array.from(external).sort(),
    internal: Array.from(internal).sort(),
  };
}

export async function buildEntry(categorySlug: string, slug: string): Promise<RegistryEntry | null> {
  const cat = findCategory(categorySlug);
  const comp = findComponent(categorySlug, slug);
  if (!cat || !comp) return null;

  const requiredFiles = [comp.file, ...(comp.extraFiles ?? [])];
  const componentGraph = await collectSourceGraph(requiredFiles);
  const previewPath = `components/previews/${categorySlug}/${slug}.preview.tsx`;
  const previewSource = await readOptionalSourceFile(previewPath);
  const previewGraph = previewSource ? await collectSourceGraph([previewPath]) : null;
  const componentFileSet = new Set(requiredFiles);
  const files = mergeRegistryFiles(componentGraph.files, previewGraph?.files ?? [], componentFileSet, previewPath);

  return {
    slug: comp.slug,
    name: comp.name,
    description: comp.description,
    category: cat.slug,
    source_url: `${SITE_URL}/r/${slug}/raw`,
    detail_url: `${SITE_URL}/r/${slug}`,
    raw_url: `${SITE_URL}/r/${slug}/raw`,
    page_url: `${SITE_URL}/components/${categorySlug}/${slug}`,
    dependencies: Array.from(new Set([...componentGraph.external, ...(previewGraph?.external ?? [])])).sort(),
    internal: Array.from(new Set([...componentGraph.internal, ...(previewGraph?.internal ?? [])])).sort(),
    files,
  };
}

function mergeRegistryFiles(
  componentFiles: SourceFile[],
  previewFiles: SourceFile[],
  componentFileSet: Set<string>,
  previewPath: string,
) {
  const seen = new Set<string>();
  const files: RegistryFile[] = [];

  for (const file of [...componentFiles, ...previewFiles]) {
    if (seen.has(file.path)) continue;
    seen.add(file.path);
    files.push({
      path: file.path,
      type: file.path === previewPath ? "preview" : componentFileSet.has(file.path) ? "component" : "util",
      content: file.content,
    });
  }

  return files;
}

export async function buildShadcnItem(
  categorySlug: string,
  slug: string,
  { includeContent = true }: { includeContent?: boolean } = {},
): Promise<ShadcnRegistryItem | null> {
  const comp = findComponent(categorySlug, slug);
  if (!comp) return null;

  const graph = await collectSourceGraph([comp.file, ...(comp.extraFiles ?? [])]);
  const dependencies = graph.external.filter((dep) => !SHADCN_DEP_SKIP.has(dep));

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: comp.slug,
    type: "registry:component",
    title: comp.name,
    description: comp.description,
    author: "Saurabh <saurabh10102@gmail.com>",
    dependencies,
    registryDependencies: [],
    files: uniqueByPath(
      graph.files.map((file) => shadcnFile(file.path, includeContent ? file.content : undefined)),
    ),
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
