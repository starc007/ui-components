import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getProEntry,
  getProIndex,
  PRO_PACKAGE_MANAGERS,
  PRO_REGISTRY_SETUP,
  proInstallCommand,
  type ProPackageManager,
  type ProRegistryItem,
} from "./pro-registry.js";

type ProEnv = {
  PRO_REGISTRY_URL?: string;
};

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const error = (message: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: message }],
});

function score(item: Omit<ProRegistryItem, "$schema">, query: string) {
  const normalized = query.toLowerCase();
  const name = item.name.toLowerCase();
  const title = item.title.toLowerCase();
  if (name === normalized || title === normalized) return 100;
  if (name.includes(normalized) || title.includes(normalized)) return 60;
  if (item.description.toLowerCase().includes(normalized)) return 30;
  return 0;
}

function summary(item: Omit<ProRegistryItem, "$schema">) {
  return {
    slug: item.name,
    name: item.title,
    description: item.description,
  };
}

export function createProServer(env: ProEnv, authorization: string) {
  const server = new McpServer({
    name: "beUI Pro",
    version: "0.1.0",
  });

  server.registerTool(
    "list_components",
    {
      description:
        "List every installable beUI Pro premium animated block and component available to this license.",
      inputSchema: {},
    },
    async () => {
      try {
        const index = await getProIndex(env, authorization);
        return json(index.items.map(summary));
      } catch (cause) {
        return error(
          `Failed to list beUI Pro components: ${(cause as Error).message}`,
        );
      }
    },
  );

  server.registerTool(
    "search_components",
    {
      description:
        "Search installable beUI Pro blocks and components by name, slug, or description. Returns the closest matches first.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe("Search term, such as 'hero', 'social proof', or 'pricing'."),
      },
    },
    async ({ query }) => {
      try {
        const index = await getProIndex(env, authorization);
        const matches = index.items
          .map((item) => ({ item, relevance: score(item, query) }))
          .filter(({ relevance }) => relevance > 0)
          .sort((a, b) => b.relevance - a.relevance)
          .map(({ item }) => summary(item));
        return json(matches);
      } catch (cause) {
        return error(
          `Failed to search beUI Pro components: ${(cause as Error).message}`,
        );
      }
    },
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Get a licensed beUI Pro item with its dependencies and complete source files. Use the returned source to install or adapt the block in the current project.",
      inputSchema: {
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .describe("An exact slug returned by list_components or search_components."),
      },
    },
    async ({ slug }) => {
      try {
        const item = await getProEntry(env, authorization, slug);
        return json({
          slug: item.name,
          name: item.title,
          description: item.description,
          dependencies: item.dependencies,
          registryDependencies: item.registryDependencies,
          install: proInstallCommand(item.name, "bun"),
          requiredRegistries: PRO_REGISTRY_SETUP,
          files: item.files.map((file) => ({
            path: file.path,
            target: file.target,
            type: file.type,
            content: file.content,
          })),
        });
      } catch (cause) {
        return error(
          `Could not load beUI Pro component "${slug}": ${(cause as Error).message}`,
        );
      }
    },
  );

  server.registerTool(
    "get_install_command",
    {
      description:
        "Get the authenticated shadcn CLI install command and required components.json registry configuration for an installable beUI Pro item.",
      inputSchema: {
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .describe("An exact slug returned by list_components or search_components."),
        packageManager: z
          .enum(["bun", "npm", "pnpm", "yarn"])
          .default("bun")
          .describe("Package manager. Defaults to bun."),
      },
    },
    async ({ slug, packageManager }) => {
      try {
        // Verify the slug and entitlement before returning an install command.
        const item = await getProEntry(env, authorization, slug);
        const pm = packageManager as ProPackageManager;
        return json({
          slug: item.name,
          packageManager: pm,
          command: proInstallCommand(item.name, pm),
          all: PRO_PACKAGE_MANAGERS.map((manager) => ({
            packageManager: manager,
            command: proInstallCommand(item.name, manager),
          })),
          requiredEnvironmentVariable: "BEUI_PRO_TOKEN",
          requiredRegistries: PRO_REGISTRY_SETUP,
        });
      } catch (cause) {
        return error(
          `Could not create an install command for "${slug}": ${(cause as Error).message}`,
        );
      }
    },
  );

  return server;
}
