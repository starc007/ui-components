import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { CodeBlock } from "@/components/app/docs/code-block";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { Link } from "@/lib/navigation";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import { SITE_URL } from "@/lib/site";
import { PageMessages } from "./page-messages";

const PAGE_PATH = "/docs/ai-agents";

const ENDPOINTS = [
  { key: "llmsTxt", url: "/llms.txt" },
  { key: "registryIndex", url: "/r" },
  { key: "componentDetail", url: "/r/{slug}" },
  { key: "shadcnCatalog", url: "/registry.json" },
  { key: "shadcnItem", url: "/r/{slug}.json" },
  { key: "rawSource", url: "/r/{slug}/raw" },
] as const;

const MCP_URL = "https://mcp.beui.dev/mcp";

const SKILL_SNIPPET = `npx skills add starc007/ui-components --skill beui`;

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
  "category": "blocks",
  "page_url": "https://beui.dev/components/blocks/swap",
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

export const getAIAgentsPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.aiAgents.meta");
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: {
        canonical: PAGE_PATH,
        types: { "text/markdown": `${PAGE_PATH}.md` },
      },
      openGraph: {
        title: `${t("title")} · beUI`,
        description: t("description"),
        url: PAGE_PATH,
        locale: "en_US",
        type: "article",
        siteName: "beUI",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: `${t("title")} · beUI`,
        images: [DEFAULT_OG_IMAGE],
      },
    };
    const [skill, mcpCli, mcpManual, fetchFlow, shadcn, entryShape] = await Promise.all([
      highlight(SKILL_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(MCP_CLI_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(MCP_MANUAL_SNIPPET, { lang: "json", filename: "mcp.json" }),
      highlight(FETCH_SNIPPET, { lang: "ts", filename: "agent.ts" }),
      highlight(SHADCN_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(ENTRY_SHAPE, { lang: "json", filename: "r/swap.json" }),
    ]);
    return {
      metadata,
      messages: messages.Pages.aiAgents,
      code: { skill, mcpCli, mcpManual, fetchFlow, shadcn, entryShape },
    };
  });

export type AIAgentsPageData = Awaited<ReturnType<typeof getAIAgentsPage>>;

const code = (chunks: ReactNode) => (
  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
    {chunks}
  </code>
);

export function AIAgentsPage({ data }: { data: AIAgentsPageData }) {
  return (
    <PageMessages page="aiAgents" messages={data.messages}>
      <AIAgentsContent data={data} />
    </PageMessages>
  );
}

function AIAgentsContent({ data }: { data: AIAgentsPageData }) {
  const t = useTranslations("Pages.aiAgents");
  const blocks = data.code;

  return (
    <GuideShell>
      <header id="overview" className="scroll-mt-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("header.eyebrow")}
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {t("header.title")}
          </h1>
          <CopyPage
            pageUrl={`${SITE_URL}${PAGE_PATH}`}
            markdownPath={`${PAGE_PATH}.md`}
            componentName="Agent Guide"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("header.intro")}
        </p>
      </header>

      <h2
        id="agent-skill"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("agentSkill.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("agentSkill.body", { code })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.skill} />
      </div>

      <h2
        id="mcp-server"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("mcpServer.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("mcpServer.body", { code, url: MCP_URL })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.mcpCli} />
      </div>
      <p className="mt-4 text-muted-foreground">{t("mcpServer.manual")}</p>
      <div className="mt-4">
        <CodeBlock {...blocks.mcpManual} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.rich("mcpServer.toolsWithNative", { code })}
      </p>

      <h2
        id="endpoints"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("endpoints.title")}
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
                  {t(`endpoints.${e.key}.label`)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`endpoints.${e.key}.desc`)}
              </p>
            </div>
            {!e.url.includes("{") ? (
              // Machine endpoints are not site routes, so a plain anchor.
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {t("endpoints.open")}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <h2
        id="agent-flow"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("agentFlow.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">{t("agentFlow.body")}</p>
      <div className="mt-4">
        <CodeBlock {...blocks.fetchFlow} />
      </div>

      <h2
        id="shadcn-flow"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("shadcnFlow.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">{t("shadcnFlow.body")}</p>
      <div className="mt-4">
        <CodeBlock {...blocks.shadcn} />
      </div>

      <h2
        id="entry-shape"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("entryShape.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("entryShape.body", { code })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.entryShape} />
      </div>

      <h2
        id="generative-ui"
        className="mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      >
        {t("generativeUi.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("generativeUi.body", {
          link: (chunks) => (
            <Link
              href="/docs/openui"
              className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </GuideShell>
  );
}
