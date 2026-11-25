// WebMCP tools for beui.dev: a browser API (W3C Web Machine Learning CG
// draft) where a page registers tools and an AI agent working in the tab
// calls them instead of reading the page. Every tool here only reads: the
// catalog comes from lib/registry.ts and docs from the static Markdown the
// build writes next to each page, so a call never runs the Worker.
import { componentPath } from "@/lib/component-paths";
import { allComponents, type ComponentEntry, isInstallable, registry } from "@/lib/registry";
import { docsPathFor } from "@/lib/variant-pages";

type CatalogEntry = ReturnType<typeof allComponents>[number];

/** The part of `document.modelContext` the site uses. */
export interface ModelContext {
  registerTool(tool: WebMcpTool): unknown;
}

export interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  /** Resolves with JSON text: `{ ok: true, data }` or `{ ok: false, error }`. */
  execute(input: Record<string, unknown>): Promise<string>;
}

// Long enough for any component's docs, short enough for one tool result.
const MAX_MARKDOWN = 40_000;
const PACKAGE_MANAGERS = {
  npm: "npx shadcn@latest add",
  pnpm: "pnpm dlx shadcn@latest add",
  yarn: "yarn dlx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
} as const;

// Expected failures are answers, not rejections: hosts drop rejection reasons.
const ok = (data: unknown) => JSON.stringify({ ok: true, data });
const fail = (code: string, message: string, retryable: boolean, hint?: string) =>
  JSON.stringify({ ok: false, error: { code, message, retryable }, ...(hint ? { hint } : {}) });

function installSlugs(component: ComponentEntry) {
  const variants = (component.examples ?? []).filter(isInstallable);
  return variants.length ? variants.map((example) => example.installSlug) : [component.slug];
}

function summary(component: CatalogEntry) {
  const path = componentPath(component.category.slug, component.slug);
  return {
    slug: component.slug,
    name: component.name,
    category: component.category.slug,
    description: component.description,
    install_slugs: installSlugs(component),
    page: path,
    markdown: `${path}.md`,
  };
}

/** Finds a page by its page slug or by any of its install slugs. */
function resolve(slug: string) {
  const wanted = slug.trim().toLowerCase().replace(/^@beui\//, "");
  for (const component of allComponents()) {
    if (component.slug === wanted) return { component, installSlug: undefined };
    const example = (component.examples ?? []).find((e) => e.installSlug === wanted);
    if (example) return { component, installSlug: wanted };
  }
  return null;
}

async function fetchMarkdown(path: string) {
  const response = await fetch(path, { headers: { accept: "text/markdown" } });
  if (!response.ok) return null;
  const text = await response.text();
  return text.length > MAX_MARKDOWN
    ? { markdown: text.slice(0, MAX_MARKDOWN), truncated: true }
    : { markdown: text, truncated: false };
}

const NOT_FOUND_HINT = "Call search_components to find the slug.";

export const siteTools: WebMcpTool[] = [
  {
    name: "search_components",
    description:
      "Search beUI's React components by name, keyword or use, like toast, slider or chat. Returns matches with install slugs and doc links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to match, like 'bottom sheet' or 'loading'." },
        category: {
          type: "string",
          enum: registry.map((category) => category.slug),
          description: "Only search this category.",
        },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "Most results to return. Default: 8." },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
    async execute({ query, category, limit }) {
      const words = String(query ?? "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      if (!words.length) return fail("invalid_input", "query is empty.", false);
      const max = Math.min(20, Math.max(1, Number(limit) || 8));
      const scored = allComponents()
        .filter((component) => !category || component.category.slug === category)
        .map((component) => {
          const name = `${component.name} ${component.slug}`.toLowerCase();
          const keywords = (component.keywords ?? []).join(" ").toLowerCase();
          const description = component.description.toLowerCase();
          let score = 0;
          for (const word of words) {
            if (name.includes(word)) score += 3;
            if (keywords.includes(word)) score += 2;
            if (description.includes(word)) score += 1;
          }
          return { component, score };
        })
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score);
      return ok({ total: scored.length, results: scored.slice(0, max).map((match) => summary(match.component)) });
    },
  },
  {
    name: "get_component_docs",
    description:
      "Get one beUI component's docs as Markdown: usage code, every prop with its type and default, and accessibility notes. Read before writing code with it.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Page slug or install slug, like 'tabs' or 'button-base'." },
      },
      required: ["slug"],
    },
    annotations: { readOnlyHint: true },
    async execute({ slug }) {
      const found = resolve(String(slug ?? ""));
      if (!found) return fail("not_found", `No beUI component "${slug}".`, false, NOT_FOUND_HINT);
      const { component, installSlug } = found;
      const path = installSlug
        ? docsPathFor(component.category.slug, component.slug, installSlug)
        : componentPath(component.category.slug, component.slug);
      try {
        const docs = await fetchMarkdown(`${path}.md`);
        if (!docs) return fail("unavailable", "The docs could not be loaded.", true);
        return ok({ slug: installSlug ?? component.slug, ...docs });
      } catch {
        return fail("unavailable", "The docs could not be loaded.", true);
      }
    },
  },
  {
    name: "get_install_command",
    description:
      "Get the shadcn CLI command that copies a beUI component's source into a project, with its dependencies.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Page slug or install slug, like 'tabs' or 'button-base'." },
        package_manager: {
          type: "string",
          enum: Object.keys(PACKAGE_MANAGERS),
          description: "Package manager the project uses. Default: npm.",
        },
      },
      required: ["slug"],
    },
    annotations: { readOnlyHint: true },
    async execute({ slug, package_manager }) {
      const found = resolve(String(slug ?? ""));
      if (!found) return fail("not_found", `No beUI component "${slug}".`, false, NOT_FOUND_HINT);
      const runner =
        PACKAGE_MANAGERS[(package_manager as keyof typeof PACKAGE_MANAGERS) ?? "npm"] ?? PACKAGE_MANAGERS.npm;
      const slugs = found.installSlug ? [found.installSlug] : installSlugs(found.component);
      return ok({
        commands: slugs.map((installSlug) => ({ install_slug: installSlug, command: `${runner} @beui/${installSlug}` })),
        ...(slugs.length > 1 ? { hint: "This page installs by variant; pick the one you need." } : {}),
      });
    },
  },
  {
    name: "read_page",
    description: "Read the beUI page open in this tab as Markdown, which is shorter than its HTML.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    async execute() {
      const link = document.querySelector<HTMLLinkElement>('link[rel="alternate"][type="text/markdown"]');
      if (!link) {
        return fail("no_markdown", "This page has no Markdown version.", false, "The site index is at /llms.txt.");
      }
      try {
        const docs = await fetchMarkdown(new URL(link.href).pathname);
        if (!docs) return fail("unavailable", "The page's Markdown could not be loaded.", true);
        return ok({ path: location.pathname, ...docs });
      } catch {
        return fail("unavailable", "The page's Markdown could not be loaded.", true);
      }
    },
  },
];

/** Registers every site tool. A tool the context refuses (say, already there) is skipped. */
export function registerSiteTools(context: ModelContext) {
  for (const tool of siteTools) {
    try {
      context.registerTool(tool);
    } catch {
      // Registered by an earlier load of this module (hot reload).
    }
  }
}
