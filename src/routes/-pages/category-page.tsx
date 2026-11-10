import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import { getTranslations } from "@/i18n/server";
import { categoryPath } from "@/lib/component-paths";
import { isComponentNew } from "@/lib/component-status";
import type { Metadata } from "@/lib/head";
import { ogImagePath } from "@/lib/og-paths";
import { type ComponentEntry, findCategory } from "@/lib/registry";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";

/** Copy per category in messages Docs.category; unknown categories read as motion. */
const CONTENT_KEYS = ["motion", "blocks", "charts", "casino", "agents"] as const;
type ContentKey = (typeof CONTENT_KEYS)[number];

function contentKey(slug: string): ContentKey {
  return CONTENT_KEYS.find((key) => key === slug) ?? "motion";
}

const AGENT_CATEGORY_GROUPS = [
  {
    id: "conversation",
    key: "conversation",
    slugs: ["prompt-input", "message", "message-bubble", "message-scroller"],
  },
  {
    id: "responses",
    key: "responses",
    slugs: ["streaming-response", "image-generation", "citations"],
  },
  {
    id: "progress",
    key: "progress",
    slugs: ["loading-states", "todo-list", "agent-activity"],
  },
  {
    id: "tools",
    key: "tools",
    slugs: ["tool-result", "code-block", "file-diff"],
  },
  {
    id: "human-control",
    key: "humanControl",
    slugs: ["tool-approval", "approval-card"],
  },
] as const;

type CategoryPageInput = { category: string };

type AgentGroup = {
  id: string;
  title: string;
  description: string;
  components: ComponentEntry[];
};

/**
 * A category listing: cards, the new/all split (decided at build
 * time, like the old static pages), agent groups, metadata and JSON-LD.
 */
export const getCategoryPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((input: CategoryPageInput) => input)
  .handler(async ({ data: { category } }) => {
    const rawCat = findCategory(category);
    if (!rawCat) return null;

    const t = getTranslations("Docs.category");
    // Cards never show the guide; keep it out of the page data.
    const cat = {
      ...rawCat,
      components: rawCat.components.map(({ guide: _guide, ...comp }) => comp),
    };
    const key = contentKey(cat.slug);
    const title = t(`${key}.title`);
    const description = t(`${key}.description`);
    const ogTitle = `${title} · beUI`;
    const path = categoryPath(cat.slug);
    const imageUrl = ogImagePath("category", cat.slug);

    const metadata: Metadata = {
      title,
      description,
      keywords: [
        `${rawCat.name} components`,
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
        ...rawCat.components.map((comp) => comp.name),
      ],
      openGraph: {
        title: ogTitle,
        description,
        url: path,
        type: "website",
        siteName: "beUI",
        locale: "en_US",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: t("ogImageAlt", { name: cat.name }),
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: path,
        types: { "application/json": "/registry.json" },
      },
    };

    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: "beUI", path: "/" },
        { name: cat.name, path },
      ]),
      categoryJsonLd(rawCat),
    ];

    const now = Date.now();
    const agentGroups: AgentGroup[] =
      cat.slug === "agents"
        ? AGENT_CATEGORY_GROUPS.map((group) => ({
            id: group.id,
            title: t(`agentGroups.${group.key}.title`),
            description: t(`agentGroups.${group.key}.description`),
            components: group.slugs.flatMap((slug) => {
              const component = cat.components.find((item) => item.slug === slug);
              return component ? [component] : [];
            }),
          }))
        : [];

    return {
      metadata,
      jsonLd,
      slug: cat.slug,
      name: cat.name,
      contentKey: key,
      newComponents: cat.components.filter((comp) => isComponentNew(comp, now)),
      components: cat.components.filter((comp) => !isComponentNew(comp, now)),
      agentGroups,
    };
  });

export type CategoryPageData = NonNullable<Awaited<ReturnType<typeof getCategoryPage>>>;

/** Loader for the category listing routes. */
export async function loadCategoryPage(input: CategoryPageInput) {
  const data = await getCategoryPage({ data: input });
  if (!data) throw notFound();
  return data;
}

const GRID_CLASS =
  "grid grid-cols-1 gap-4 [grid-auto-rows:17rem] sm:grid-cols-2 2xl:grid-cols-3";

export function CategoryPage({ data }: { data: CategoryPageData }) {
  const t = useTranslations("Docs.category");
  const tDocs = useTranslations("Docs");
  const { slug, contentKey: key, newComponents, components, agentGroups } = data;

  return (
    <div>
      <JsonLd data={data.jsonLd} />
      <nav aria-label={tDocs("breadcrumb")} className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">{data.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        {t(`${key}.heading`)}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{t(`${key}.description`)}</p>
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>

      <div>
        {agentGroups.length ? (
          <div className="mt-12 space-y-14">
            {agentGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-medium tracking-tight text-foreground">
                    {group.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className={`mt-5 ${GRID_CLASS}`}>
                  {group.components.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={slug} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <>
            {newComponents.length ? (
              <section className="mt-10">
                <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
                  {t("new")}
                </h2>
                <div className={`mt-4 ${GRID_CLASS}`}>
                  {newComponents.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={slug} />
                  ))}
                </div>
              </section>
            ) : null}

            {components.length ? (
              <section className="mt-10">
                <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
                  {t(`${key}.allLabel`)}
                </h2>
                <div className={`mt-4 ${GRID_CLASS}`}>
                  {components.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={slug} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
