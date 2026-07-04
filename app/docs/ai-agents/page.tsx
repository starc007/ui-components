import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";

export const metadata: Metadata = {
  title: "AI Agents",
  description:
    "Connect the beUI MCP server, or use the agent-friendly endpoints (llms.txt, JSON registry, raw source) to consume components programmatically.",
  alternates: { canonical: "/docs/ai-agents" },
  openGraph: {
    title: "AI Agents · beUI",
    description:
      "Connect the beUI MCP server, or use the agent-friendly endpoints (llms.txt, JSON registry, raw source) to consume components programmatically.",
    url: "/docs/ai-agents",
    type: "article",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agents · beUI",
    images: ["/api/og"],
  },
};

const ENDPOINTS: { label: string; url: string; desc: string }[] = [
  {
    label: "llms.txt",
    url: "/llms.txt",
    desc: "Markdown index in llmstxt.org format.",
  },
  {
    label: "Registry index",
    url: "/r",
    desc: "JSON catalogue of every component.",
  },
  {
    label: "Component detail",
    url: "/r/{slug}",
    desc: "JSON with files, deps, source.",
  },
  {
    label: "shadcn catalog",
    url: "/registry.json",
    desc: "Directory-compatible registry catalog.",
  },
  {
    label: "shadcn item",
    url: "/r/{slug}.json",
    desc: "Install item with inline file content and shadcn semantic color classes.",
  },
  {
    label: "Raw source",
    url: "/r/{slug}/raw",
    desc: "Plain text .tsx ready to drop in.",
  },
];

const MCP_URL = "https://mcp.beui.dev/mcp";

const MCP_CLI_SNIPPET = `# Claude Code
claude mcp add --transport http beui https://mcp.beui.dev/mcp

# Codex
codex mcp add beui --url https://mcp.beui.dev/mcp

# Amp
amp mcp add beui https://mcp.beui.dev/mcp`;

const MCP_MANUAL_SNIPPET = `{
  "mcpServers": {
    "beui": {
      "type": "http",
      "url": "https://mcp.beui.dev/mcp"
    }
  }
}`;

const FETCH_SNIPPET = `// 1. Discover what exists
const idx = await fetch('https://beui.dev/r').then((r) => r.json());

// 2. Fetch a component
const entry = await fetch(\`https://beui.dev/r/\${slug}\`).then((r) => r.json());

// 3. Write files into the user's project
for (const file of entry.files) {
  await writeFile(file.path, file.content);
}

// 4. Install external deps
await runShell(['bun', 'add', ...entry.dependencies]);`;

const SHADCN_SNIPPET = `# Official registry namespace (shadcn directory)
npx shadcn@latest add @beui/animated-toast-stack

# Direct URL, no namespace needed
npx shadcn@latest add https://beui.dev/r/animated-toast-stack.json`;

const ENTRY_SHAPE = `{
  "slug": "swap",
  "name": "Multi-chain Swap",
  "description": "Cross-chain swap widget with chain + token selectors, animated flip and quote.",
  "category": "motion",
  "page_url": "https://beui.dev/components/motion/swap",
  "detail_url": "https://beui.dev/r/swap",
  "raw_url": "https://beui.dev/r/swap/raw",
  "dependencies": ["motion", "lucide-react", "react"],
  "internal": ["@/lib/utils"],
  "files": [
    { "path": "components/motion/swap.tsx", "type": "component", "content": "..." },
    { "path": "components/previews/motion/swap.preview.tsx", "type": "preview", "content": "..." },
    { "path": "lib/utils.ts", "type": "util", "content": "..." }
  ]
}`;

export default function AIAgentsPage() {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Intro
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        For AI agents
      </h1>
      <p className="mt-3 text-muted-foreground">
        beUI exposes a static, agent-friendly surface. Connect the MCP server
        below, or hit the raw endpoints directly. Coding agents (Claude, Codex,
        Cursor, Amp) can list components, fetch source with all deps, and drop
        files into the user&apos;s project.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        MCP server
      </h2>
      <p className="mt-2 text-muted-foreground">
        The fastest path: connect the beUI MCP server and your agent can list,
        search and install components directly. Hosted at{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          {MCP_URL}
        </code>
        .
      </p>
      <div className="mt-4">
        <CodeBlock code={MCP_CLI_SNIPPET} lang="bash" filename="terminal" />
      </div>
      <p className="mt-4 text-muted-foreground">
        Any other client: add it manually to your MCP config.
      </p>
      <div className="mt-4">
        <CodeBlock code={MCP_MANUAL_SNIPPET} lang="json" filename="mcp.json" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Tools:{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          list_components
        </code>
        ,{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          search_components
        </code>
        ,{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          get_component
        </code>
        ,{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          get_install_command
        </code>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Endpoints
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {ENDPOINTS.map((e) => (
          <li
            key={e.url}
            className="flex items-start justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-xs text-foreground">
                  {e.url}
                </code>
                <span className="text-sm font-medium text-foreground">
                  {e.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
            </div>
            {!e.url.includes("{") ? (
              <Link
                href={e.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Open
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Agent flow
      </h2>
      <p className="mt-2 text-muted-foreground">
        Four calls, then install. Components are self-contained and own their
        files.
      </p>
      <div className="mt-4">
        <CodeBlock code={FETCH_SNIPPET} lang="ts" filename="agent.ts" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        shadcn flow
      </h2>
      <p className="mt-2 text-muted-foreground">
        The shadcn item installs source files and package dependencies.
        Components use shadcn semantic color utilities directly, so they inherit
        the target app&apos;s theme without beUI-specific color variables.
      </p>
      <div className="mt-4">
        <CodeBlock code={SHADCN_SNIPPET} lang="bash" filename="terminal" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Entry shape
      </h2>
      <p className="mt-2 text-muted-foreground">
        Internal helpers (e.g.{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          @/lib/utils
        </code>
        ) ship inline as{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
          type: util
        </code>{" "}
        so the agent does not have to chase imports.
      </p>
      <div className="mt-4">
        <CodeBlock code={ENTRY_SHAPE} lang="json" filename="r/swap.json" />
      </div>
    </>
  );
}
