import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/code-block";

export const metadata = {
  title: "AI Agents · beUI v2",
  description: "Endpoints for coding agents to consume beUI components programmatically.",
};

const ENDPOINTS: { label: string; url: string; desc: string }[] = [
  { label: "llms.txt", url: "/llms.txt", desc: "Markdown index in llmstxt.org format." },
  { label: "Registry index", url: "/r", desc: "JSON catalogue of every component." },
  { label: "Component detail", url: "/r/{slug}", desc: "JSON with files, deps, source." },
  { label: "shadcn catalog", url: "/registry.json", desc: "Directory-compatible registry catalog." },
  { label: "shadcn item", url: "/r/{slug}.json", desc: "Install item with inline file content and CSS token bridge." },
  { label: "Raw source", url: "/r/{slug}/raw", desc: "Plain text .tsx ready to drop in." },
];

const FETCH_SNIPPET = `// 1. Discover what exists
const idx = await fetch('https://beui.saura3h.xyz/r').then((r) => r.json());

// 2. Fetch a component
const entry = await fetch(\`https://beui.saura3h.xyz/r/\${slug}\`).then((r) => r.json());

// 3. Write files into the user's project
for (const file of entry.files) {
  await writeFile(file.path, file.content);
}

// 4. Install external deps
await runShell(['bun', 'add', ...entry.dependencies]);`;

const SHADCN_SNIPPET = `# Direct install
npx shadcn@latest add https://beui.saura3h.xyz/r/animated-toast-stack.json

# Namespace install
npx shadcn@latest registry add @beui=https://beui.saura3h.xyz/r/{name}.json
npx shadcn@latest add @beui/animated-toast-stack`;

const ENTRY_SHAPE = `{
  "slug": "swap",
  "name": "Multi-chain Swap",
  "description": "Cross-chain swap widget with chain + token selectors, animated flip and quote.",
  "category": "motion",
  "page_url": "https://beui.saura3h.xyz/components/motion/swap",
  "detail_url": "https://beui.saura3h.xyz/r/swap",
  "raw_url": "https://beui.saura3h.xyz/r/swap/raw",
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
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)">Intro</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--color-fg)">For AI agents</h1>
      <p className="mt-3 text-(--color-fg-muted)">
        beUI exposes a static, agent-friendly surface. Coding agents (Cursor, Claude, GPT, custom MCP) can list components, fetch source with all deps, and drop files into the user&apos;s project with one HTTP call.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-(--color-fg)">Endpoints</h2>
      <ul className="mt-4 divide-y divide-(--color-border) rounded-2xl border border-(--color-border) bg-(--color-bg-elev)">
        {ENDPOINTS.map((e) => (
          <li key={e.url} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-(--color-fg)/5 px-2 py-0.5 font-mono text-xs text-(--color-fg)">{e.url}</code>
                <span className="text-sm font-medium text-(--color-fg)">{e.label}</span>
              </div>
              <p className="mt-1 text-sm text-(--color-fg-muted)">{e.desc}</p>
            </div>
            {!e.url.includes("{") ? (
              <Link
                href={e.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-1 text-xs text-(--color-fg-muted) hover:text-(--color-fg)"
              >
                Open
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-(--color-fg)">Agent flow</h2>
      <p className="mt-2 text-(--color-fg-muted)">Four calls, then install. Components are self-contained and own their files.</p>
      <div className="mt-4">
        <CodeBlock code={FETCH_SNIPPET} filename="agent.ts" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-(--color-fg)">shadcn flow</h2>
      <p className="mt-2 text-(--color-fg-muted)">
        The shadcn item installs source files, package dependencies, and a CSS token bridge that maps beUI&apos;s internal variables onto the target app&apos;s shadcn theme.
      </p>
      <div className="mt-4">
        <CodeBlock code={SHADCN_SNIPPET} lang="bash" filename="terminal" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-(--color-fg)">Entry shape</h2>
      <p className="mt-2 text-(--color-fg-muted)">
        Internal helpers (e.g. <code className="rounded bg-(--color-fg)/5 px-1.5 py-0.5 font-mono text-xs">@/lib/utils</code>) ship inline as <code className="rounded bg-(--color-fg)/5 px-1.5 py-0.5 font-mono text-xs">type: util</code> so the agent does not have to chase imports.
      </p>
      <div className="mt-4">
        <CodeBlock code={ENTRY_SHAPE} filename="r/swap.json" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-(--color-fg)">Caching</h2>
      <p className="mt-2 text-(--color-fg-muted)">
        All routes are pre-rendered at build, served with <code className="rounded bg-(--color-fg)/5 px-1.5 py-0.5 font-mono text-xs">cache-control: public, max-age=300, s-maxage=3600</code>.
      </p>
    </div>
  );
}
