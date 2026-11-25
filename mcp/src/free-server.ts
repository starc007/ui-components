import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getEntry,
  getIndex,
  getMarkdown,
  getNativeEntry,
  getNativeIndex,
  installCommand,
  installSlugs,
  PACKAGE_MANAGERS,
  type IndexComponent,
  type PackageManager,
  type RegistryIndex,
} from "./registry.js";
import { searchComponents } from "./search.js";

export type FreeEnv = {
  REGISTRY_URL?: string;
};

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const error = (message: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: message }],
});

/** What list and search return per component. */
function summary(c: IndexComponent) {
  return {
    slug: c.slug,
    name: c.name,
    category: c.category,
    description: c.description,
    // The slugs `shadcn add @beui/<slug>` accepts; a page that splits into
    // variants installs only by its variants' slugs.
    install_slugs: c.install_slugs ?? [c.slug],
    ...(c.variants?.length ? { variants: c.variants } : {}),
  };
}

/** The page a slug belongs to: its own page, or the page of a variant. */
function findPage(index: RegistryIndex, slug: string) {
  return index.components.find((c) => c.slug === slug) ?? installSlugs(index).get(slug);
}

const THEME_ITEM = "https://beui.dev/r/theme.json";

export function createFreeServer(env: FreeEnv) {
  const server = new McpServer({ name: "beUI", version: "0.2.0" });

  server.registerTool(
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
        const index = await getIndex(env);
        const components = category
          ? index.components.filter((c) => c.category === category)
          : index.components;
        return json(components.map(summary));
      } catch (e) {
        return error(`Failed to list components: ${(e as Error).message}`);
      }
    },
  );

  server.registerTool(
    "search_components",
    {
      description:
        "Search beUI components by what you need, e.g. 'bottom sheet', 'toast', 'prompt input'. Every word must match. Names, slugs and keywords rank first; descriptions count only when nothing matches by name. Each result lists its install_slugs.",
      inputSchema: {
        query: z.string().describe("What to find, e.g. 'bottom sheet', 'toast', 'command palette'."),
      },
    },
    async ({ query }) => {
      try {
        const index = await getIndex(env);
        return json(searchComponents(index.components, query).map(summary));
      } catch (e) {
        return error(`Search failed: ${(e as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_component_docs",
    {
      description:
        "Get a beUI component's documentation as Markdown: install command, dependencies, usage code, every prop with its type, default and description, the data types its props take (e.g. CommandItem), composition and when to use it, accessibility and FAQ. Read this before writing code that uses the component.",
      inputSchema: {
        slug: z
          .string()
          .describe("A page or install slug, e.g. 'command-palette' or 'button-stateful'."),
      },
    },
    async ({ slug }) => {
      try {
        return { content: [{ type: "text" as const, text: await getMarkdown(env, slug) }] };
      } catch (e) {
        return error(
          `No docs for "${slug}": ${(e as Error).message}. Use search_components to find a valid slug.`,
        );
      }
    },
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Get a beUI component's source by slug: description, npm dependencies, every source file (path + contents) and the install command. Use this to copy the component into a project by hand; get_component_docs explains how to use it.",
      inputSchema: {
        slug: z.string().describe("Component slug, e.g. 'bottom-sheet' (from list_components/search_components)."),
      },
    },
    async ({ slug }) => {
      try {
        const [entry, index] = await Promise.all([getEntry(env, slug), getIndex(env)]);
        const page = findPage(index, slug);
        const slugs = page?.install_slugs ?? [entry.slug];
        const installable = slugs.includes(entry.slug);
        return json({
          slug: entry.slug,
          name: entry.name,
          description: entry.description,
          category: entry.category,
          page_url: entry.page_url,
          docs: `Call get_component_docs with "${entry.slug}" for props, types and usage.`,
          dependencies: entry.dependencies,
          // A page that splits into variants has no install of its own.
          install: installable
            ? installCommand(entry.slug, "bun")
            : slugs.map((s) => installCommand(s, "bun")),
          ...(page?.variants?.length ? { variants: page.variants } : {}),
          theme: `Uses beUI theme tokens? The shadcn install adds them; for a hand copy, run \`npx shadcn@latest add ${THEME_ITEM}\` or paste https://beui.dev/theme.css once.`,
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

  server.registerTool(
    "get_install_command",
    {
      description:
        "Get the shadcn CLI install command for a beUI component, for a given package manager. Checks the slug: a page that splits into variants returns its variants' commands instead, and an unknown slug returns the closest matches.",
      inputSchema: {
        slug: z.string().describe("Install slug, e.g. 'command-palette' or 'button-stateful'."),
        packageManager: z
          .enum(["bun", "npm", "pnpm", "yarn"])
          .default("bun")
          .describe("Package manager. Defaults to bun."),
      },
    },
    async ({ slug, packageManager }) => {
      const pm = packageManager as PackageManager;
      try {
        const index = await getIndex(env);
        const valid = installSlugs(index);
        if (valid.has(slug)) {
          return json({
            slug,
            packageManager: pm,
            command: installCommand(slug, pm),
            all: PACKAGE_MANAGERS.map((p) => ({ packageManager: p, command: installCommand(slug, p) })),
          });
        }
        const page = index.components.find((c) => c.slug === slug);
        if (page?.variants?.length) {
          return json({
            slug,
            note: `"${slug}" is a page with separate variants; install one of them.`,
            variants: page.variants.map((v) => ({ ...v, command: installCommand(v.install_slug, pm) })),
          });
        }
        const suggestions = searchComponents(index.components, slug.replace(/-/g, " ")).slice(0, 5);
        return error(
          `"${slug}" is not a beUI install slug.${
            suggestions.length
              ? ` Closest: ${suggestions.flatMap((c) => c.install_slugs ?? [c.slug]).join(", ")}.`
              : ""
          } Use search_components to find one.`,
        );
      } catch (e) {
        return error(`Could not check "${slug}": ${(e as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_setup",
    {
      description:
        "One-time project setup for beUI: what a project needs (Tailwind CSS v4, motion, the shadcn CLI) and how to add beUI's theme tokens. Call this once before installing components into a new project.",
      inputSchema: {},
    },
    async () => {
      try {
        const index = await getIndex(env);
        return json({
          requirements: ["React 18 or 19", "Tailwind CSS v4", "the motion package (installed with each component)"],
          summary: index.setup,
          with_shadcn: {
            steps: [
              "If the project has no components.json yet, run `npx shadcn@latest init` once.",
              "Install components with `npx shadcn@latest add @beui/<install_slug>`. Each brings its files, npm dependencies and, if it needs them, beUI's theme tokens.",
              `To add the theme tokens up front: \`npx shadcn@latest add ${THEME_ITEM}\`. It adds to the theme and changes no existing color.`,
            ],
          },
          without_shadcn: {
            steps: [
              "Paste https://beui.dev/theme.css into globals.css below `@import \"tailwindcss\";` once. It has the base and beUI tokens, animations and utilities.",
              "Copy a component's files from get_component, keeping their paths, and install its npm dependencies.",
            ],
          },
          docs: "https://beui.dev/docs/theme",
          agent_guide: "https://beui.dev/docs/ai-agents.md",
        });
      } catch (e) {
        return error(`Could not load setup: ${(e as Error).message}`);
      }
    },
  );

  server.registerTool(
    "list_native_components",
    {
      description:
        "List beUI Native components: the React Native versions of beUI components, for Expo and bare React Native apps (Reanimated, Gesture Handler, Uniwind). Optionally filter by a keyword. Includes one-time setup notes and an Expo Go link to try them.",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Keyword to filter by name, slug, description or group, e.g. 'select' or 'forms'."),
      },
    },
    async ({ query }) => {
      try {
        const index = await getNativeIndex(env);
        const q = query?.toLowerCase().trim();
        const components = q
          ? index.components.filter((c) =>
              [c.slug, c.name, c.description, c.group].some((field) =>
                field.toLowerCase().includes(q),
              ),
            )
          : index.components;
        return json({
          name: index.name,
          repository: index.repository,
          expo_go: index.expo_go,
          setup: index.setup,
          cli: "npx beui-native add <slug>",
          components: components.map((c) => ({
            slug: c.slug,
            name: c.name,
            group: c.group,
            description: c.description,
          })),
        });
      } catch (e) {
        return error(`Failed to list native components: ${(e as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_native_component",
    {
      description:
        "Get a beUI Native (React Native) component by slug. Prefer `cli`: run it from the app's root to copy the component and its shared files and install missing libraries. Also returns the install commands, setup notes, and every file with paths and contents, for copying by hand. Keep the folder layout when copying; files import each other by relative path.",
      inputSchema: {
        slug: z.string().describe("Component slug, e.g. 'select' (from list_native_components)."),
      },
    },
    async ({ slug }) => {
      try {
        const entry = await getNativeEntry(env, slug);
        return json({
          slug: entry.slug,
          name: entry.name,
          description: entry.description,
          page_url: entry.page_url,
          expo_go_url: entry.expo_go_url,
          // Copies the files and installs missing libraries in one step.
          cli: `npx beui-native add ${entry.slug}`,
          install: entry.install,
          setup: entry.setup,
          files: entry.files,
        });
      } catch (e) {
        return error(`Could not load native component "${slug}": ${(e as Error).message}`);
      }
    },
  );

  return server;
}
