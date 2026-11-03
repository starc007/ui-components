import { categoryPath } from "@/lib/component-paths";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { localizeCategory } from "@/i18n/catalog";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, localizedPath, routing } from "@/i18n/routing";
import { findCategory, registry } from "@/lib/registry";
import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { isComponentNew } from "@/lib/component-status";
import { breadcrumbJsonLd, categoryJsonLd } from "@/lib/seo";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";

/** Copy per category in messages Docs.category; unknown categories read as motion. */
const CONTENT_KEYS = ["motion", "blocks", "charts", "agents"] as const;
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

type CategoryParams = Promise<{ locale: string; category: string }>;

export function generateStaticParams() {
  return registry.filter((c) => c.slug !== "charts").map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: CategoryParams;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const cat = findCategory(category);
  if (!cat) return {};

  const [messages, t] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: "Docs.category" }),
  ]);
  const key = contentKey(cat.slug);
  const title = t(`${key}.title`);
  const description = t(`${key}.description`);
  const ogTitle = `${title} · beUI`;
  const alternates = localeAlternates(categoryPath(cat.slug), locale);
  const imageUrl = `/api/og?category=${cat.slug}`;
  const componentNames = cat.components.map((comp) => comp.name);

  return {
    title,
    description,
    // Search keywords stay English.
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
      description,
      url: alternates.canonical,
      type: "website",
      siteName: "beUI",
      locale: LANGUAGES[locale].og,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: t("ogImageAlt", { name: localizeCategory(cat, messages).name }),
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
      ...alternates,
      types: {
        "application/json": "/registry.json",
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: CategoryParams;
}) {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const rawCat = findCategory(category);
  if (!rawCat) notFound();
  const [messages, t, tDocs] = await Promise.all([
    getMessages(),
    getTranslations("Docs.category"),
    getTranslations("Docs"),
  ]);
  const cat = localizeCategory(rawCat, messages);
  const key = contentKey(cat.slug);
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
          title: t(`agentGroups.${group.key}.title`),
          description: t(`agentGroups.${group.key}.description`),
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
            { name: "beUI", path: localizedPath("/", locale) },
            { name: cat.name, path: localizedPath(categoryPath(cat.slug), locale) },
          ]),
          categoryJsonLd(cat, locale),
        ]}
      />
      <nav
        aria-label={tDocs("breadcrumb")}
        className="flex items-center gap-1.5 text-sm"
      >
        <span className="font-medium text-foreground">{cat.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        {t(`${key}.heading`)}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {t(`${key}.description`)}
      </p>
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
                <div className="mt-5 grid grid-cols-1 gap-4 [grid-auto-rows:17rem] sm:grid-cols-2 2xl:grid-cols-3">
                  {group.components.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={cat.slug} />
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
                <div className="mt-4 grid grid-cols-1 gap-4 [grid-auto-rows:17rem] sm:grid-cols-2 2xl:grid-cols-3">
                  {newComponents.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={cat.slug} />
                  ))}
                </div>
              </section>
            ) : null}

            {components.length ? (
              <section className="mt-10">
                <h2 className="font-display text-xs font-medium uppercase text-muted-foreground">
                  {t(`${key}.allLabel`)}
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 [grid-auto-rows:17rem] sm:grid-cols-2 2xl:grid-cols-3">
                  {components.map((comp) => (
                    <LandingComponentCard key={comp.slug} component={comp} category={cat.slug} />
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
