import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { breadcrumbJsonLd, docsArticleJsonLd } from "@/lib/seo";

const PAGE_TITLE = "OpenUI integration guide";
const PAGE_DESCRIPTION =
  "Build an OpenUI React integration with beUI. Register animated components, generate the system prompt, stream OpenUI Lang, and render interactive UI.";
const PAGE_PATH = "/docs/openui";
const PAGE_IMAGE = "/api/og?page=openui";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: `${PAGE_TITLE} · beUI`,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    type: "article",
    siteName: "beUI",
    images: [
      {
        url: PAGE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Use beUI with OpenUI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} · beUI`,
    description: PAGE_DESCRIPTION,
    images: [{ url: PAGE_IMAGE, alt: "Use beUI with OpenUI" }],
  },
};

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

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      // Grammar + a signature and description for every registered component,
      // so the model only ever emits nodes your library defines.
      { role: "system", content: generateSystemPrompt({ library: beuiLibrarySpec }) },
      ...messages,
    ],
  });

  const response = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta.content;
          if (content) controller.enqueue(encoder.encode(content));
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

const RESOURCES: { label: string; url: string; desc: string }[] = [
  {
    label: "OpenUI",
    url: "https://www.openui.com",
    desc: "The generative UI framework and its OpenUI Lang.",
  },
  {
    label: "Defining components",
    url: "https://www.openui.com/docs/openui-lang/defining-components",
    desc: "Full defineComponent / createLibrary reference.",
  },
  {
    label: "shadcn chat example",
    url: "https://www.openui.com/docs/openui-lang/examples/shadcn-chat",
    desc: "The registry-library pattern this guide follows.",
  },
];

export default function OpenUIPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "OpenUI integration", path: PAGE_PATH },
          ]),
          docsArticleJsonLd({
            path: PAGE_PATH,
            headline: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            image: PAGE_IMAGE,
            datePublished: "2026-07-27",
            dateModified: "2026-08-13",
            about: [
              "OpenUI React integration",
              "Custom OpenUI component library",
              "Generative UI",
              "beUI",
            ],
          }),
        ]}
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Integration
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Use beUI with OpenUI
      </h1>
      <p className="mt-3 text-muted-foreground">
        <Link
          href="https://www.openui.com"
          target="_blank"
          rel="noreferrer noopener"
          className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
        >
          OpenUI
        </Link>{" "}
        is a generative UI framework: instead of returning markdown, the model
        emits an abstract UI tree (OpenUI Lang) and a React runtime maps every
        node to a component <em>you</em> register. This OpenUI React integration
        turns beUI into a custom OpenUI component library, so each generated
        response uses real, animated components—and only the components you
        allow.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Install
      </h2>
      <p className="mt-2 text-muted-foreground">
        You need OpenUI&apos;s React runtime and the beUI components you want to
        expose. Pull beUI source with the shadcn registry (see the{" "}
        <Link
          href="/docs/ai-agents"
          className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
        >
          AI Agents
        </Link>{" "}
        guide for other install paths).
      </p>
      <div className="mt-4">
        <CodeBlock code={INSTALL_SNIPPET} lang="bash" filename="terminal" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Scaffolding from scratch? Run{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          npx @openuidev/cli@latest create
        </code>{" "}
        for a working streaming app, then swap its default library for the beUI
        one below.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Register components
      </h2>
      <p className="mt-2 text-muted-foreground">
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          defineComponent
        </code>{" "}
        maps one OpenUI Lang node to a beUI component. The Zod{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          props
        </code>{" "}
        schema validates the model&apos;s output as it streams, the{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          description
        </code>{" "}
        is injected into the system prompt so the model learns each
        component&apos;s intent, and{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          useTriggerAction
        </code>{" "}
        keeps rendered controls interactive. Describe a container&apos;s children
        as a union of the registered{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          .ref
        </code>{" "}
        schemas so nesting is both validated and advertised to the model.
      </p>
      <div className="mt-4">
        <CodeBlock code={DEFINE_SNIPPET} lang="tsx" filename="lib/beui-library.tsx" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Assemble the library
      </h2>
      <p className="mt-2 text-muted-foreground">
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          createLibrary
        </code>{" "}
        collects the definitions, names the{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          root
        </code>{" "}
        node, and organises the prompt into{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          componentGroups
        </code>{" "}
        with notes that steer how the model reaches for each one.
      </p>
      <div className="mt-4">
        <CodeBlock code={LIBRARY_SNIPPET} lang="tsx" filename="lib/beui-library.tsx" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Generate the prompt
      </h2>
      <p className="mt-2 text-muted-foreground">
        The client renders OpenUI Lang, but the model has to produce it. In the
        CLI, call{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          npx @openuidev/cli@latest generate --spec ./lib/beui-library.tsx --out ./lib/generated/beui-library.spec.json
        </code>{" "}
        to build the library spec. The backend combines its component
        signatures, descriptions, and nesting constraints with the OpenUI Lang
        grammar, then streams the model&apos;s reply back to the browser.
      </p>
      <div className="mt-4">
        <CodeBlock code={PROMPT_SNIPPET} lang="tsx" filename="app/api/generate/route.ts" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Run that command when the library changes. It serializes the library to
        JSON at build time, and the route imports that generated file through
        the same{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          @/lib/generated
        </code>{" "}
        path, so the server bundle never imports your client components.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Render the stream
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pass the library to{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          &lt;Renderer&gt;
        </code>{" "}
        on the client. It parses the OpenUI Lang your server streams and paints
        beUI components progressively as tokens arrive. Wire{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          onAction
        </code>{" "}
        to send a pressed button&apos;s message back to the model and continue
        the loop.
      </p>
      <div className="mt-4">
        <CodeBlock code={RENDER_SNIPPET} lang="tsx" filename="generative-response.tsx" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Why beUI fits
      </h2>
      <p className="mt-2 text-muted-foreground">
        beUI components own their files and ship through the registry, so
        there&apos;s no runtime to bolt on — the library above <em>is</em> the
        integration. They use semantic controls and shadcn tokens, so
        model-generated UIs inherit the host app&apos;s theme without extra wiring.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Resources
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {RESOURCES.map((r) => (
          <li key={r.url} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">
                {r.label}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </div>
            <Link
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        Other generative UI frameworks that consume shadcn registries can pull
        beUI the same way — more integration guides to come.
      </p>
    </>
  );
}
