import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { localeAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { LANGUAGES, type Locale, localizedPath } from "@/i18n/routing";
import { getMessages, getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { ogImagePath } from "@/lib/og-paths";
import { breadcrumbJsonLd, docsArticleJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { PageMessages } from "./page-messages";

const PAGE_PATH = "/docs/openui";
const PAGE_IMAGE = ogImagePath("page", "openui");

const SCAFFOLD_COMMAND = "npx @openuidev/cli@latest create";
const GENERATE_COMMAND =
  "npx @openuidev/cli@latest generate --spec ./lib/beui-library.tsx --out ./lib/generated/beui-library.spec.json";

const INSTALL_SNIPPET = `# OpenUI runtime, server prompt generation, and schema validation
npm install @openuidev/react-lang @openuidev/lang-core zod

# Your model SDK (any provider works)
npm install openai

# Pull the beUI components you want to expose (shadcn registry)
npx shadcn@latest add @beui/button @beui/animated-badge @beui/animated-number`;

const DEFINE_SNIPPET = `import { defineComponent, useTriggerAction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { Button } from "@/components/motion/button";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { AnimatedNumber } from "@/components/motion/animated-number";

// beUI Button — the model picks a variant and an optional press ripple.
// \`useTriggerAction\` keeps it live: pressing it sends \`action\` back to the
// model, so generated buttons continue the conversation instead of sitting inert.
const BeButton = defineComponent({
  name: "Button",
  description:
    "Spring-pressed action button. \`action\` is the message sent to the model when pressed.",
  props: z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(["primary", "secondary", "ghost", "outline"]).default("primary"),
    ripple: z.boolean().default(false),
  }),
  component: ({ props }) => {
    const triggerAction = useTriggerAction();
    return (
      <Button
        variant={props.variant}
        ripple={props.ripple}
        onClick={() => triggerAction(props.action)}
      >
        {props.label}
      </Button>
    );
  },
});

// beUI status pill with a pulse and animated state icon.
const BeBadge = defineComponent({
  name: "Badge",
  description:
    "Status pill. Pick a status colour; set pulse for live or in-progress states.",
  props: z.object({
    label: z.string(),
    status: z
      .enum(["neutral", "info", "success", "warning", "danger", "loading"])
      .default("neutral"),
    pulse: z.boolean().default(false),
  }),
  component: ({ props }) => (
    <AnimatedBadge status={props.status} pulse={props.pulse}>
      {props.label}
    </AnimatedBadge>
  ),
});

// beUI spring count-up for a single metric.
const BeStat = defineComponent({
  name: "Stat",
  description: "A single numeric metric that springs up from zero when shown.",
  props: z.object({ label: z.string(), value: z.number() }),
  component: ({ props }) => (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{props.label}</p>
      <AnimatedNumber value={props.value} className="text-2xl font-semibold" />
    </div>
  ),
});

// The root node stacks the components above. Describe its children as a union
// of each component's \`.ref\` (declared after the components exist): the runtime
// validates what may nest here, and the model sees exactly which nodes are
// allowed inside — both of which \`z.any()\` would throw away.
const StackChild = z.union([BeButton.ref, BeBadge.ref, BeStat.ref]);

const Stack = defineComponent({
  name: "Stack",
  description: "Vertical container. Children stack top to bottom with spacing.",
  props: z.object({ children: z.array(StackChild) }),
  component: ({ props, renderNode }) => (
    <div className="flex flex-col gap-3">{renderNode(props.children)}</div>
  ),
});`;

const LIBRARY_SNIPPET = `import { createLibrary } from "@openuidev/react-lang";

export const beuiLibrary = createLibrary({
  root: "Stack",
  components: [Stack, BeButton, BeBadge, BeStat],
  componentGroups: [
    {
      name: "Layout",
      components: ["Stack"],
      notes: ["Every response is a single Stack at the root."],
    },
    {
      name: "beUI motion",
      components: ["Button", "Badge", "Stat"],
      notes: [
        "Use Badge with pulse for live or streaming status.",
        "One Button per response, as the primary action.",
      ],
    },
  ],
});`;

const PROMPT_SNIPPET = `import OpenAI from "openai";
import { generateSystemPrompt } from "@openuidev/lang-core";
import beuiLibrarySpec from "@/lib/generated/beui-library.spec.json";

const openai = new OpenAI();

// The generated library spec teaches the model which OpenUI Lang it may emit.
export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await openai.responses.create({
    model: "gpt-5.6-sol",
    stream: true,
    store: false,
    // Grammar + a signature and description for every registered component,
    // so the model only ever emits nodes your library defines.
    instructions: generateSystemPrompt({ library: beuiLibrarySpec }),
    input: messages,
  });

  const response = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(event.delta));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(response, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}`;

const RENDER_SNIPPET = `"use client";

import { Renderer } from "@openuidev/react-lang";
import { beuiLibrary } from "@/lib/beui-library";

// \`response\` is the OpenUI Lang your server streams from the model.
export function GenerativeResponse({
  response,
  isStreaming,
  onSend,
}: {
  response: string | null;
  isStreaming: boolean;
  onSend: (message: string) => void;
}) {
  return (
    <Renderer
      response={response}
      library={beuiLibrary}
      isStreaming={isStreaming}
      // A registered Button was pressed — send its message back to the
      // model to continue the conversation.
      onAction={(event) => onSend(event.humanFriendlyMessage)}
    />
  );
}`;

const RESOURCES = [
  { key: "openui", url: "https://www.openui.com" },
  {
    key: "definingComponents",
    url: "https://www.openui.com/docs/openui-lang/defining-components",
  },
  {
    key: "shadcnChat",
    url: "https://www.openui.com/docs/openui-lang/examples/shadcn-chat",
  },
] as const;

export const getOpenUIPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const [messages, t] = await Promise.all([
      getMessages({ locale }),
      getTranslations({ locale, namespace: "Pages.openui" }),
    ]);
    const alternates = localeAlternates(PAGE_PATH, locale);
    const title = t("meta.title");
    const description = t("meta.description");
    const metadata: Metadata = {
      title,
      description,
      alternates: {
        ...alternates,
        types: { "text/markdown": `${PAGE_PATH}.md` },
      },
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: alternates.canonical,
        locale: LANGUAGES[locale].og,
        type: "article",
        siteName: "beUI",
        images: [
          {
            url: PAGE_IMAGE,
            width: 1200,
            height: 630,
            alt: t("meta.imageAlt"),
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · beUI`,
        description,
        images: [PAGE_IMAGE],
      },
    };

    const localPath = localizedPath(PAGE_PATH, locale);
    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: t("breadcrumb.home"), path: localizedPath("/", locale) },
        { name: t("breadcrumb.page"), path: localPath },
      ]),
      {
        ...docsArticleJsonLd({
          path: localPath,
          headline: title,
          description,
          image: PAGE_IMAGE,
          datePublished: "2026-07-27",
          dateModified: "2026-08-14",
          about: [t("about.integration"), t("about.library"), t("about.generativeUi"), "beUI"],
        }),
        inLanguage: LANGUAGES[locale].hreflang,
      },
    ];

    const [install, define, library, prompt, render] = await Promise.all([
      highlight(INSTALL_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(DEFINE_SNIPPET, { lang: "tsx", filename: "lib/beui-library.tsx" }),
      highlight(LIBRARY_SNIPPET, { lang: "tsx", filename: "lib/beui-library.tsx" }),
      highlight(PROMPT_SNIPPET, { lang: "tsx", filename: "app/api/generate/route.ts" }),
      highlight(RENDER_SNIPPET, { lang: "tsx", filename: "generative-response.tsx" }),
    ]);

    return {
      metadata,
      jsonLd,
      messages: messages.Pages.openui,
      code: { install, define, library, prompt, render },
    };
  });

export type OpenUIPageData = Awaited<ReturnType<typeof getOpenUIPage>>;

const code = (chunks: ReactNode) => (
  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
    {chunks}
  </code>
);

const em = (chunks: ReactNode) => <em>{chunks}</em>;

const H2_CLASS =
  "mt-10 scroll-mt-24 text-xl font-medium tracking-tight text-foreground";

export function OpenUIPage({ data }: { data: OpenUIPageData }) {
  return (
    <PageMessages page="openui" messages={data.messages}>
      <OpenUIContent data={data} />
    </PageMessages>
  );
}

function OpenUIContent({ data }: { data: OpenUIPageData }) {
  const t = useTranslations("Pages.openui");
  const blocks = data.code;

  return (
    <GuideShell>
      <JsonLd data={data.jsonLd} />
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
            componentName="OpenUI Guide"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t.rich("header.intro", {
            em,
            link: (chunks) => (
              <a
                href="https://www.openui.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </header>

      <h2 id="install" className={H2_CLASS}>
        {t("install.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("install.body", {
          link: (chunks) => (
            <Link
              href="/docs/ai-agents"
              className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.install} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.rich("install.scaffold", { code, command: SCAFFOLD_COMMAND })}
      </p>

      <h2 id="register-components" className={H2_CLASS}>
        {t("registerComponents.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("registerComponents.body", { code })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.define} />
      </div>

      <h2 id="assemble-library" className={H2_CLASS}>
        {t("assembleLibrary.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("assembleLibrary.body", { code })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.library} />
      </div>

      <h2 id="generate-prompt" className={H2_CLASS}>
        {t("generatePrompt.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("generatePrompt.body", { code, command: GENERATE_COMMAND })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.prompt} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.rich("generatePrompt.note", { code })}
      </p>

      <h2 id="render-stream" className={H2_CLASS}>
        {t("renderStream.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("renderStream.body", { code, renderer: "<Renderer>" })}
      </p>
      <div className="mt-4">
        <CodeBlock {...blocks.render} />
      </div>

      <h2 id="why-beui" className={H2_CLASS}>
        {t("whyBeui.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("whyBeui.body", { em })}
      </p>

      <h2 id="resources" className={H2_CLASS}>
        {t("resources.title")}
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {RESOURCES.map((r) => (
          <li key={r.url} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">
                {t(`resources.${r.key}.label`)}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`resources.${r.key}.desc`)}
              </p>
            </div>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {t("resources.open")}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">{t("resources.more")}</p>
    </GuideShell>
  );
}
