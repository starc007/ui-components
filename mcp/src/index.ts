import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import {
  getEntry,
  getIndex,
  installCommand,
  PACKAGE_MANAGERS,
  type IndexComponent,
  type PackageManager,
} from "./registry.js";

interface Env {
  BeUiMcp: DurableObjectNamespace;
  REGISTRY_URL?: string;
}

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const error = (message: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: message }],
});

/** Lightweight relevance score over a component's name/description/category. */
function score(comp: IndexComponent, query: string) {
  const q = query.toLowerCase();
  const name = comp.name.toLowerCase();
  const slug = comp.slug.toLowerCase();
  if (slug === q || name === q) return 100;
  if (slug.includes(q) || name.includes(q)) return 60;
  if (comp.description.toLowerCase().includes(q)) return 30;
  if (comp.category.toLowerCase().includes(q)) return 10;
  return 0;
}

export class BeUiMcp extends McpAgent<Env, Record<string, never>, Record<string, never>> {
  server = new McpServer({
    name: "beUI",
    version: "0.1.0",
  });

  initialState = {};

  async init() {
    this.server.registerTool(
      "list_components",
      {
        description:
          "List beUI components (animated React/Next.js components). Optionally filter by category slug (e.g. 'motion' or 'blocks').",
        inputSchema: {
          category: z
            .string()
            .optional()
            .describe("Category slug to filter by, e.g. 'motion' or 'blocks'."),
        },
      },
      async ({ category }) => {
        try {
          const index = await getIndex(this.env);
          const components = category
            ? index.components.filter((c) => c.category === category)
            : index.components;
          return json(
            components.map((c) => ({
              slug: c.slug,
              name: c.name,
              category: c.category,
              description: c.description,
            })),
          );
        } catch (e) {
          return error(`Failed to list components: ${(e as Error).message}`);
        }
      },
    );

    this.server.registerTool(
      "search_components",
      {
        description:
          "Search beUI components by keyword. Matches name, slug, description and category. Returns the best matches first.",
        inputSchema: {
          query: z.string().describe("Search term, e.g. 'bottom sheet', 'toast', 'command palette'."),
        },
      },
      async ({ query }) => {
        try {
          const index = await getIndex(this.env);
          const ranked = index.components
            .map((c) => ({ c, s: score(c, query) }))
            .filter((r) => r.s > 0)
            .sort((a, b) => b.s - a.s)
            .map((r) => ({
              slug: r.c.slug,
              name: r.c.name,
              category: r.c.category,
              description: r.c.description,
            }));
          return json(ranked);
        } catch (e) {
          return error(`Search failed: ${(e as Error).message}`);
        }
      },
    );

    this.server.registerTool(
      "get_component",
      {
        description:
          "Get full details for a beUI component by slug: description, npm dependencies, every source file (path + contents) and the install command. Use this to copy the component into a project.",
        inputSchema: {
          slug: z.string().describe("Component slug, e.g. 'bottom-sheet' (from list_components/search_components)."),
        },
      },
      async ({ slug }) => {
        try {
          const entry = await getEntry(this.env, slug);
          return json({
            slug: entry.slug,
            name: entry.name,
            description: entry.description,
            category: entry.category,
            page_url: entry.page_url,
            dependencies: entry.dependencies,
            install: installCommand(entry.slug, "bun"),
            files: entry.files.map((f) => ({
              path: f.path,
              type: f.type,
              content: f.content,
            })),
          });
        } catch (e) {
          return error(`Could not load component "${slug}": ${(e as Error).message}`);
        }
      },
    );

    this.server.registerTool(
      "get_install_command",
      {
        description:
          "Get the shadcn CLI install command for a beUI component, for a given package manager.",
        inputSchema: {
          slug: z.string().describe("Component slug, e.g. 'command-palette'."),
          packageManager: z
            .enum(["bun", "npm", "pnpm", "yarn"])
            .default("bun")
            .describe("Package manager. Defaults to bun."),
        },
      },
      async ({ slug, packageManager }) => {
        const pm = packageManager as PackageManager;
        return json({
          slug,
          packageManager: pm,
          command: installCommand(slug, pm),
          all: PACKAGE_MANAGERS.map((p) => ({ packageManager: p, command: installCommand(slug, p) })),
        });
      },
    );
  }
}

const LANDING = `beUI MCP server

Animated components for React and Next.js, available through a remote MCP server.

Connect your MCP client to:
  https://mcp.beui.dev/mcp   (Streamable HTTP, recommended)
  https://mcp.beui.dev/sse   (SSE, legacy)

Tools: list_components, search_components, get_component, get_install_command
Docs:  https://beui.dev
`;

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/mcp")) {
      return BeUiMcp.serve("/mcp", { binding: "BeUiMcp" }).fetch(request, env, ctx);
    }

    if (url.pathname.startsWith("/sse")) {
      return BeUiMcp.serveSSE("/sse", { binding: "BeUiMcp" }).fetch(request, env, ctx);
    }

    return new Response(LANDING, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
