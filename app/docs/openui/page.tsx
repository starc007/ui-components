import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";

export const metadata: Metadata = {
  title: "OpenUI",
  description:
    "Register beUI components as an OpenUI library so a generative UI runtime renders model output with real, animated beUI components.",
  alternates: { canonical: "/docs/openui" },
  openGraph: {
    title: "OpenUI · beUI",
    description:
      "Register beUI components as an OpenUI library so a generative UI runtime renders model output with real, animated beUI components.",
    url: "/docs/openui",
    type: "article",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenUI · beUI",
    images: ["/api/og"],
  },
};

const INSTALL_SNIPPET = `# OpenUI runtime + schema validation
npm install @openuidev/react-lang zod

# Pull the beUI components you want to expose (shadcn registry)
npx shadcn@latest add @beui/button @beui/animated-badge @beui/animated-number`;

const DEFINE_SNIPPET = `import { defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { Button } from "@/components/motion/button";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { AnimatedNumber } from "@/components/motion/animated-number";

// The root node. Every response stacks its children into this container.
const Stack = defineComponent({
  name: "Stack",
  description: "Vertical container. Children stack top to bottom with spacing.",
  props: z.object({ children: z.array(z.any()) }),
  component: ({ props, renderNode }) => (
    <div className="flex flex-col gap-3">{renderNode(props.children)}</div>
  ),
});

// beUI Button — the model picks a variant and an optional press ripple.
const BeButton = defineComponent({
  name: "Button",
  description:
    "Spring-pressed action button. Use for the primary call to action in a response.",
  props: z.object({
    label: z.string(),
    variant: z.enum(["primary", "secondary", "ghost", "outline"]).default("primary"),
    ripple: z.boolean().default(false),
  }),
  component: ({ props }) => (
    <Button variant={props.variant} ripple={props.ripple}>
      {props.label}
    </Button>
  ),
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

const RENDER_SNIPPET = `"use client";

import { Renderer } from "@openuidev/react-lang";
import { beuiLibrary } from "./beui-library";

// \`response\` is the OpenUI Lang your server streams from the model.
export function GenerativeResponse({
  response,
  isStreaming,
}: {
  response: string | null;
  isStreaming: boolean;
}) {
  return (
    <Renderer response={response} library={beuiLibrary} isStreaming={isStreaming} />
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
        node to a component <em>you</em> register. Register beUI components as
        that library and each generated response renders with real, animated
        beUI motion — the model can only ever use the components you allow.
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
        schema validates the model&apos;s output as it streams, and the{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          description
        </code>{" "}
        is injected into the system prompt — so the model learns each
        component&apos;s intent from the same string that documents it.
      </p>
      <div className="mt-4">
        <CodeBlock code={DEFINE_SNIPPET} lang="tsx" filename="beui-library.tsx" />
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
        <CodeBlock code={LIBRARY_SNIPPET} lang="tsx" filename="beui-library.tsx" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Render the stream
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pass the library to{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          &lt;Renderer&gt;
        </code>{" "}
        on the client. It parses the OpenUI Lang your server streams and paints
        beUI components progressively as tokens arrive.
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
        integration. Every component gates transform motion behind{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          useReducedMotion
        </code>{" "}
        and styles with shadcn tokens, so model-generated UIs stay accessible
        and inherit the host app&apos;s theme without extra wiring.
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
