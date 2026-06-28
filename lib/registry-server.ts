import { allComponents, findCategory, registry } from "@/lib/registry";
import { pageUrlFor, withSignature } from "@/lib/signature";
import { SITE_URL } from "@/lib/site";
import { readOptionalSourceFile, readSourceFile, resolveSourceImport, type SourceFile } from "@/lib/source-files";

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
  type: "registry:component" | "registry:block";
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

export type RegistryTarget = {
  slug: string;
  name: string;
  description: string;
  file: string;
  extraFiles?: string[];
  categorySlug: string;
  pageSlug: string;
  previewFile?: string;
};

const STATIC_IMPORT_RE = /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const SHADCN_DEP_SKIP = new Set(["next", "react", "react-dom"]);

function parseDeps(source: string) {
  const external = new Set<string>();
  const internal = new Set<string>();
  const specs = new Set<string>();

  for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    re.lastIndex = 0;
    while (true) {
      const match = re.exec(source);
      if (!match) break;
      const spec = match[1];
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

export function allRegistryTargets(): RegistryTarget[] {
  return allComponents().flatMap((component) => {
    const visibleTarget: RegistryTarget = {
      slug: component.slug,
      name: component.name,
      description: component.description,
      file: component.file,
      extraFiles: component.extraFiles,
      categorySlug: component.category.slug,
      pageSlug: component.slug,
    };

    const variantTargets: RegistryTarget[] = (component.examples ?? [])
      .filter((example) => example.installSlug)
      .map((example) => ({
        slug: example.installSlug as string,
        name: `${component.name} ${example.name}`,
        description: example.description ?? component.description,
        file: example.file,
        categorySlug: component.category.slug,
        pageSlug: component.slug,
        previewFile: example.previewFile,
      }));

    return [visibleTarget, ...variantTargets];
  });
}

export function allShadcnTargets(): RegistryTarget[] {
  return allComponents().flatMap((component) => {
    const variantTargets: RegistryTarget[] = (component.examples ?? [])
      .filter((example) => example.installSlug)
      .map((example) => ({
        slug: example.installSlug as string,
        name: `${component.name} ${example.name}`,
        description: example.description ?? component.description,
        file: example.file,
        categorySlug: component.category.slug,
        pageSlug: component.slug,
        previewFile: example.previewFile,
      }));

    if (variantTargets.length > 0) return variantTargets;

    return [{
      slug: component.slug,
      name: component.name,
      description: component.description,
      file: component.file,
      extraFiles: component.extraFiles,
      categorySlug: component.category.slug,
      pageSlug: component.slug,
    }];
  });
}

export function findRegistryTarget(slug: string) {
  return allRegistryTargets().find((target) => target.slug === slug);
}

function findShadcnTarget(slug: string) {
  return allShadcnTargets().find((target) => target.slug === slug);
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
  const comp = findRegistryTarget(slug);
  if (!cat || !comp || comp.categorySlug !== categorySlug) return null;

  const requiredFiles = [comp.file, ...(comp.extraFiles ?? [])];
  const componentGraph = await collectSourceGraph(requiredFiles);
  const previewPath = comp.previewFile ?? `components/previews/${categorySlug}/${slug}.preview.tsx`;
  const previewSource = await readOptionalSourceFile(previewPath);
  const previewGraph = previewSource ? await collectSourceGraph([previewPath]) : null;
  const componentFileSet = new Set(requiredFiles);
  const pageUrl = pageUrlFor(categorySlug, comp.pageSlug);
  const files = mergeRegistryFiles(componentGraph.files, previewGraph?.files ?? [], componentFileSet, previewPath, pageUrl);

  return {
    slug: comp.slug,
    name: comp.name,
    description: comp.description,
    category: cat.slug,
    source_url: `${SITE_URL}/r/${slug}/raw`,
    detail_url: `${SITE_URL}/r/${slug}`,
    raw_url: `${SITE_URL}/r/${slug}/raw`,
    page_url: `${SITE_URL}/components/${categorySlug}/${comp.pageSlug}`,
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
  pageUrl: string,
) {
  const seen = new Set<string>();
  const files: RegistryFile[] = [];

  for (const file of [...componentFiles, ...previewFiles]) {
    if (seen.has(file.path)) continue;
    seen.add(file.path);
    const isComponent = file.path !== previewPath && componentFileSet.has(file.path);
    files.push({
      path: file.path,
      type: file.path === previewPath ? "preview" : isComponent ? "component" : "util",
      content: isComponent ? withSignature(file.content, file.path, pageUrl) : file.content,
    });
  }

  return files;
}

export async function buildShadcnItem(
  categorySlug: string,
  slug: string,
  { includeContent = true }: { includeContent?: boolean } = {},
): Promise<ShadcnRegistryItem | null> {
  const comp = findShadcnTarget(slug);
  if (!comp || comp.categorySlug !== categorySlug) return null;

  const graph = await collectSourceGraph([comp.file, ...(comp.extraFiles ?? [])]);
  const dependencies = graph.external.filter((dep) => !SHADCN_DEP_SKIP.has(dep));
  const componentFileSet = new Set([comp.file, ...(comp.extraFiles ?? [])]);
  const pageUrl = pageUrlFor(comp.categorySlug, comp.pageSlug);

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: comp.slug,
    type: comp.categorySlug === "blocks" ? "registry:block" : "registry:component",
    title: comp.name,
    description: comp.description,
    author: "Saurabh <saurabh10102@gmail.com>",
    dependencies,
    registryDependencies: [],
    files: uniqueByPath(
      graph.files.map((file) => {
        if (!includeContent) return shadcnFile(file.path);
        const content = componentFileSet.has(file.path)
          ? withSignature(file.content, file.path, pageUrl)
          : file.content;
        return shadcnFile(file.path, content);
      }),
    ),
  };
}

export async function buildShadcnRegistry(): Promise<ShadcnRegistry> {
  const items = await Promise.all(
    allShadcnTargets().map(async (component) => {
      const item = await buildShadcnItem(component.categorySlug, component.slug, { includeContent: false });
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
    name: "beUI",
    description: "The motion toolkit for React and Next.js.",
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
  const target = findRegistryTarget(slug);
  return target ? registry.find((c) => c.slug === target.categorySlug) : undefined;
}
