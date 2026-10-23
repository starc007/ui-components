import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { native } from "@/lib/native";
import {
  BABEL_SNIPPET,
  CLI_SNIPPET,
  CSS_TYPES_SNIPPET,
  GLOBAL_CSS_SNIPPET,
  INSTALL_SNIPPET,
  LAYOUT_SNIPPET,
  LAYOUT_TREE,
  METRO_BARE_SNIPPET,
  METRO_EXPO_SNIPPET,
  NATIVE_VERSIONS,
  NATIVE_SETUP_PATH as PAGE_PATH,
  SOURCE_SNIPPET,
  USAGE_SNIPPET,
} from "@/lib/native-setup";
import { breadcrumbJsonLd, docsArticleJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Set up beUI Native in your React Native app";
const PAGE_DESCRIPTION =
  "One-time setup for beUI Native: install Reanimated, Gesture Handler and Uniwind, configure Metro, add the theme tokens, then copy in any component.";
const PAGE_IMAGE = "/api/og?page=native-setup";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
    types: { "text/markdown": `${PAGE_PATH}.md` },
  },
  openGraph: {
    title: `${PAGE_TITLE} · beUI`,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    type: "article",
    siteName: "beUI",
    images: [{ url: PAGE_IMAGE, width: 1200, height: 630, alt: "Set up beUI Native" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} · beUI`,
    description: PAGE_DESCRIPTION,
    images: [{ url: PAGE_IMAGE, alt: "Set up beUI Native" }],
  },
};

const link =
  "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground";

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-medium tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>;
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{children}</p>;
}

export default function NativeSetupPage() {
  return (
    <GuideShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "React Native setup", path: PAGE_PATH },
          ]),
          docsArticleJsonLd({
            path: PAGE_PATH,
            headline: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            image: PAGE_IMAGE,
            datePublished: "2026-10-16",
            dateModified: "2026-10-16",
            about: ["React Native", "Expo", "Uniwind", "Reanimated", "beUI Native"],
          }),
        ]}
      />
      <header id="overview" className="scroll-mt-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          React Native
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            Set up beUI Native
          </h1>
          <CopyPage
            pageUrl={`${SITE_URL}${PAGE_PATH}`}
            markdownPath={`${PAGE_PATH}.md`}
            componentName="React Native Setup"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          beUI Native components are plain source you copy into your app, like
          the web components. Do the setup below once per app. After that,
          adding a component is copying its files from its page. It works in
          Expo and in bare React Native.
        </p>
      </header>

      <Section id="requirements" title="Requirements">
        <Prose>The components are built and tested against these versions.</Prose>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {NATIVE_VERSIONS.map((row) => (
            <li key={row.library} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <a href={row.url} target="_blank" rel="noreferrer noopener" className={link}>
                {row.library}
              </a>
              <span className="text-muted-foreground">{row.version}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="install" title="1. Install the libraries">
        <Prose>
          In an Expo app, <Code>expo install</Code> picks the versions that
          match your SDK. Uniwind and Tailwind come from npm.
        </Prose>
        <div className="mt-4">
          <CodeBlock code={INSTALL_SNIPPET} lang="bash" filename="terminal" />
        </div>
        <Note>
          Expo&apos;s Babel preset already includes the Worklets plugin that
          Reanimated 4 needs. In a bare React Native app, add it to{" "}
          <Code>babel.config.js</Code> yourself:
        </Note>
        <div className="mt-4">
          <CodeBlock code={BABEL_SNIPPET} lang="js" filename="babel.config.js" />
        </div>
      </Section>

      <Section id="uniwind" title="2. Set up Uniwind">
        <Prose>
          Components are styled with Tailwind class names through{" "}
          <a href="https://docs.uniwind.dev" target="_blank" rel="noreferrer noopener" className={link}>
            Uniwind
          </a>
          . Create <Code>global.css</Code> in the project root. It loads
          Tailwind, Uniwind and the beUI theme you add in the next step.
        </Prose>
        <div className="mt-4">
          <CodeBlock code={GLOBAL_CSS_SNIPPET} lang="css" filename="global.css" />
        </div>
        <Prose>
          Then point Metro at it. <Code>withUniwindConfig</Code> must be the
          outermost wrapper if you use other Metro wrappers, and{" "}
          <Code>cssEntryFile</Code> must be a relative path.
        </Prose>
        <div className="mt-4">
          <CodeBlock code={METRO_EXPO_SNIPPET} lang="js" filename="metro.config.js" />
        </div>
        <Note>
          In a bare React Native app, the default config comes from{" "}
          <Code>@react-native/metro-config</Code> instead:
        </Note>
        <div className="mt-4">
          <CodeBlock code={METRO_BARE_SNIPPET} lang="js" filename="metro.config.js" />
        </div>
        <Note>
          Uniwind writes the class name types to <Code>dtsFile</Code> when Metro
          starts, so start it once before checking types. If TypeScript then
          can&apos;t find the <Code>global.css</Code> import, declare CSS files:
        </Note>
        <div className="mt-4">
          <CodeBlock code={CSS_TYPES_SNIPPET} lang="ts" filename="src/env.d.ts" />
        </div>
      </Section>

      <Section id="theme" title="3. Add the theme tokens">
        <Prose>
          Components use semantic colors like <Code>bg-primary</Code> and{" "}
          <Code>text-muted</Code>, defined for light and dark mode, so they
          follow the system appearance. Save this file as{" "}
          <Code>{native.theme.path}</Code>, the path <Code>global.css</Code>{" "}
          imports, and change the values to match your brand.
        </Prose>
        <div className="mt-4">
          <CodeBlock code={native.theme.content} lang="css" filename={native.theme.path} />
        </div>
      </Section>

      <Section id="root" title="4. Wrap your app">
        <Prose>
          Import <Code>global.css</Code> from your root component, not from the
          file that registers the app, or every style change reloads the whole
          app. Wrap the app in <Code>GestureHandlerRootView</Code> so swipeable
          and draggable components can receive gestures. With Expo Router, both
          go in the root layout:
        </Prose>
        <div className="mt-4">
          <CodeBlock code={LAYOUT_SNIPPET} lang="tsx" filename="app/_layout.tsx" />
        </div>
        <Note>
          In a bare app, do the same in <Code>App.tsx</Code>. For forms, also
          wrap the app in <Code>KeyboardProvider</Code> from{" "}
          <a
            href="https://docs.expo.dev/versions/v57.0.0/sdk/keyboard-controller/"
            target="_blank"
            rel="noreferrer noopener"
            className={link}
          >
            react-native-keyboard-controller
          </a>{" "}
          to keep focused fields above the keyboard.
        </Note>
      </Section>

      <Section id="add-component" title="5. Add a component">
        <Prose>
          Run the beUI Native CLI from your app&apos;s root. It copies the
          component and the shared files it needs into <Code>src/</Code> and
          installs any libraries you don&apos;t have yet.
        </Prose>
        <div className="mt-4">
          <CodeBlock code={CLI_SNIPPET} lang="bash" filename="terminal" />
        </div>
        <Prose>
          To copy files by hand instead, open the component from the{" "}
          <Link href="/react-native" className={link}>
            React Native components
          </Link>{" "}
          and use its Manual steps. Either way, keep the folder layout, since
          components import shared files by relative path. Tabs ends up like
          this:
        </Prose>
        <div className="mt-4">
          <CodeBlock code={LAYOUT_TREE} lang="text" filename="your app" />
        </div>
        <Prose>Then use it like any other component:</Prose>
        <div className="mt-4">
          <CodeBlock code={USAGE_SNIPPET} lang="tsx" filename="app/index.tsx" />
        </div>
        <Note>
          Tailwind finds class names in files under the folder that holds{" "}
          <Code>global.css</Code>. If it lives somewhere else, like{" "}
          <Code>app/</Code>, add an <Code>@source</Code> for the components:
        </Note>
        <div className="mt-4">
          <CodeBlock code={SOURCE_SNIPPET} lang="css" filename="app/global.css" />
        </div>
      </Section>

      <Section id="try-first" title="Try before you copy">
        <Prose>
          Every{" "}
          <Link href="/react-native" className={link}>
            React Native component
          </Link>{" "}
          page has a QR code that opens it in{" "}
          <a href="https://expo.dev/go" target="_blank" rel="noreferrer noopener" className={link}>
            Expo Go
          </a>{" "}
          (SDK {native.expoGo.sdk}), so you can feel the motion on your phone
          first. Coding agents can fetch any component with its install commands
          and files from <Code>{`${SITE_URL}/native/r`}</Code>, or through the
          beUI MCP server. See the{" "}
          <Link href="/docs/ai-agents" className={link}>
            Agent Guide
          </Link>
          .
        </Prose>
        <Note>
          Every component follows the system Reduce Motion setting and takes a{" "}
          <Code>disableAnimation</Code> prop. The source is on{" "}
          <a href={native.repository} target="_blank" rel="noreferrer noopener" className={link}>
            GitHub
          </a>
          .
        </Note>
      </Section>
    </GuideShell>
  );
}
