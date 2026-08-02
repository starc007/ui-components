import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCategory, registry } from "@/lib/registry";
import { ComponentCard } from "@/components/app/docs/component-card";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { isComponentNew } from "@/lib/component-status";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";

const categoryContent = {
  motion: {
    title: "Animated React Components — Copy-Paste Motion UI",
    heading: "Animated React components",
    description:
      "Explore free, open-source animated React components built with Motion and Tailwind CSS. Copy the TypeScript source into your app and customize every interaction.",
    supportingText:
      "Browse motion components for navigation, forms, text, feedback, overlays, and scroll experiences. Each one includes a live preview, install command, source code, API reference, and reduced-motion support.",
    allLabel: "All animated components",
  },
  blocks: {
    title: "Animated React UI Blocks — Product-Ready Motion",
    heading: "Animated React UI blocks",
    description:
      "Explore product-ready animated React blocks built with Motion and Tailwind CSS. Copy complete interactions into your app and adapt the source to your product.",
    supportingText:
      "Browse composed interfaces for uploads, navigation, trading, scheduling, notifications, and more. Every block includes a live preview, install command, TypeScript source, and implementation details.",
    allLabel: "All animated blocks",
  },
  agents: {
    title: "AI Agent Components — Animated React AI Interfaces",
    heading: "Animated AI agent components",
    description:
      "Build clear, responsive AI experiences with open-source React components for agent reasoning, progress, tool activity, and conversation states.",
    supportingText:
      "Each agent component is designed for long-running, interruptible AI work and includes a live preview, shadcn install command, TypeScript source, API reference, and reduced-motion support.",
    allLabel: "All agent components",
  },
} as const;

const AGENT_CATEGORY_GROUPS = [
  {
    id: "conversation",
    title: "Conversation components",
    description:
      "Compose prompts, arrange sender-aware messages, shape conversational surfaces, and keep streamed turns stable while the reader moves through the transcript.",
    slugs: ["prompt-input", "message", "message-bubble", "message-scroller"],
  },
  {
    id: "responses",
    title: "Response and evidence components",
    description:
      "Render rich answers as they arrive, reveal completion actions at the right time, and connect generated claims to inspectable sources.",
    slugs: ["streaming-response", "citations"],
  },
  {
    id: "progress",
    title: "Progress and planning components",
    description:
      "Communicate unknown waits, durable task plans, and chronological agent activity without inventing precision or exposing an unfiltered trace.",
    slugs: ["loading-states", "todo-list", "agent-activity"],
  },
  {
    id: "tools",
    title: "Tool and code components",
    description:
      "Present execution outcomes, generated source, and file changes with bounded streaming, stable highlighting, and inspectable completion states.",
    slugs: ["tool-result", "code-block", "file-diff"],
  },
  {
    id: "human-control",
    title: "Human-in-the-loop components",
    description:
      "Pause agent work for a scoped permission, clarification, review, or decision, then preserve the resolved outcome in the run history.",
    slugs: ["tool-approval", "approval-card"],
  },
] as const;

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) return {};

  const content =
    categoryContent[cat.slug as keyof typeof categoryContent] ??
    categoryContent.motion;
  const title = content.title;
  const ogTitle = `${title} · beUI`;
  const pageUrl = `/components/${cat.slug}`;
  const imageUrl = `/api/og?category=${cat.slug}`;
  const componentNames = cat.components.map((comp) => comp.name);

  return {
    title,
    description: content.description,
    keywords: [
      `${cat.name} components`,
      "React motion components",
      "best motion components",
      "free motion components",
      "open source motion components",
      "framer motion components",
      "best framer motion components",
      "framer motion templates",
      "Tailwind CSS components",
      "shadcn-compatible components",
      "shadcn registry",
      "beUI",
      ...componentNames,
    ],
    openGraph: {
      title: ogTitle,
      description: content.description,
      url: pageUrl,
      type: "website",
      siteName: "beUI",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.name} components by beUI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: content.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
      types: {
        "application/json": "/registry.json",
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  const content =
    categoryContent[cat.slug as keyof typeof categoryContent] ??
    categoryContent.motion;
  const now = Date.now();
  const newComponents = cat.components.filter((comp) =>
    isComponentNew(comp, now),
  );
  const components = cat.components.filter(
    (comp) => !isComponentNew(comp, now),
  );
  const agentGroups =
    cat.slug === "agents"
      ? AGENT_CATEGORY_GROUPS.map((group) => ({
          ...group,
          components: group.slugs.flatMap((slug) => {
            const component = cat.components.find((item) => item.slug === slug);
            return component ? [component] : [];
          }),
        }))
      : [];

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: cat.name, path: `/components/${cat.slug}` },
          ]),
          categoryJsonLd(cat),
        ]}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <span className="font-medium text-foreground">{cat.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {content.heading}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {content.description}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {content.supportingText}
      </p>

      {agentGroups.length ? (
        <>
          <nav
            aria-label="Agent component groups"
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y border-border py-4"
          >
            {agentGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {group.title.replace(" components", "")}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-14">
            {agentGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {group.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {group.components.map((comp) => (
                    <ComponentCard
                      key={comp.slug}
                      categorySlug={cat.slug}
                      slug={comp.slug}
                      name={comp.name}
                      description={comp.description}
                      badge={comp.badge}
                      launchedAt={comp.launchedAt}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <>
          {newComponents.length ? (
            <section className="mt-10">
              <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
                New
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {newComponents.map((comp) => (
                  <ComponentCard
                    key={comp.slug}
                    categorySlug={cat.slug}
                    slug={comp.slug}
                    name={comp.name}
                    description={comp.description}
                    badge={comp.badge}
                    launchedAt={comp.launchedAt}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
              {content.allLabel}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.slug}
                  categorySlug={cat.slug}
                  slug={comp.slug}
                  name={comp.name}
                  description={comp.description}
                  badge={comp.badge}
                  launchedAt={comp.launchedAt}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
