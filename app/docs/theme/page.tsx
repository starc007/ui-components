import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";
import { THEME_CSS } from "@/lib/theme-css";

export const metadata: Metadata = {
  title: "Theme setup",
  description:
    "One-time theme setup for beUI components: install the shadcn token layer, or paste the beUI theme CSS into your globals.css.",
  alternates: { canonical: "/docs/theme" },
  openGraph: {
    title: "Theme setup · beUI",
    description:
      "One-time theme setup for beUI components: shadcn tokens or the beUI theme CSS.",
    url: "/docs/theme",
    type: "article",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Theme setup · beUI",
    images: ["/api/og"],
  },
};

const SHADCN_INIT = `npx shadcn@latest init`;

export default function ThemePage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Setup
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Theme setup
      </h1>
      <p className="mt-3 text-muted-foreground">
        beUI components style themselves with shadcn semantic tokens
        (<code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">bg-primary</code>,
        {" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">text-muted-foreground</code>,
        {" "}border, ring). Set those tokens up once and every component works.
        Two ways:
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Option 1 — shadcn init (recommended)
      </h2>
      <p className="mt-2 text-muted-foreground">
        If your project uses shadcn, you already have these tokens. Otherwise
        run init once; it writes the token layer into your CSS.
      </p>
      <div className="mt-4">
        <CodeBlock code={SHADCN_INIT} lang="bash" filename="terminal" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        Option 2 — paste the theme CSS
      </h2>
      <p className="mt-2 text-muted-foreground">
        Not using shadcn? Paste this into your{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">globals.css</code>{" "}
        directly below{" "}
        <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">@import "tailwindcss";</code>.
        It defines the tokens, motion animations and surface utilities the
        components use. Requires Tailwind CSS v4.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Also available at{" "}
        <Link
          href="/theme.css"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
        >
          /theme.css
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        .
      </p>
      <div className="mt-4">
        <CodeBlock code={THEME_CSS} lang="css" filename="globals.css" />
      </div>
    </div>
  );
}
