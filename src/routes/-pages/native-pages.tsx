import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowRight, ChevronRight, Globe } from "lucide-react";
import { useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { ComponentCard } from "@/components/app/docs/component-card";
import { InstallCommand } from "@/components/app/docs/install-command";
import { NativePanel, type NativePanelCode } from "@/components/app/docs/native/native-panel";
import {
  NativeReadme,
  type NativeReadmeBlock,
  parseNativeReadme,
} from "@/components/app/docs/native/native-readme";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { ProBlocksSection } from "@/components/app/docs/pro-blocks-section";
import { type RelatedItem, RelatedSection } from "@/components/app/docs/related-section";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import {
  componentPath,
  NATIVE_PATH,
  nativeComponentPath,
  TOP_LEVEL_CATEGORIES,
} from "@/lib/component-paths";
import { isComponentNew } from "@/lib/component-status";
import type { Metadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { findNativeComponent, type NativeComponent, native, nativeInstallCommands } from "@/lib/native";
import nativeSlugs from "@/lib/native/slugs.json";
import { nativeComponentJsonLd, nativeIndexJsonLd } from "@/lib/native-seo";
import { Link } from "@/lib/navigation";
import { ogImagePath } from "@/lib/og-paths";
import { registry } from "@/lib/registry";
import { breadcrumbJsonLd, clampText, relatedComponents } from "@/lib/seo";

// ---------------------------------------------------------------------------
// /react-native
// ---------------------------------------------------------------------------

type NativeCard = { slug: string; title: string; description: string; launchedAt?: string };
type NativeGroup = { id: string; label: string; components: NativeCard[] };

const groupId = (name: string) => `native-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/**
 * The index leads with components still marked new (newest first), like the
 * web category pages, then lists the rest as the catalog groups them, in
 * catalog order. The catalog holds every file's source, so only the cards'
 * text leaves the server function.
 */
export const getNativeIndexPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Native.index");
    const groupNames: Record<string, string> = messages.Chrome.sidebar.nativeGroups;
    const now = Date.now();
    const isNew = (launchedAt?: string) => isComponentNew({ badge: "new", launchedAt }, now);
    const newComponents: NativeCard[] = [];
    const byName = new Map<string, NativeCard[]>();
    for (const { slug, title, description, group, launchedAt } of native.components) {
      if (isNew(launchedAt)) {
        newComponents.push({ slug, title, description, launchedAt });
        continue;
      }
      const cards = byName.get(group) ?? [];
      cards.push({ slug, title, description });
      byName.set(group, cards);
    }
    newComponents.sort((a, b) => (b.launchedAt ?? "").localeCompare(a.launchedAt ?? ""));
    const groups: NativeGroup[] = [...byName.entries()].map(([name, components]) => ({
      id: groupId(name),
      label: groupNames[name] ?? name,
      components,
    }));

    const title = t("metaTitle");
    const description = t("metaDescription");
    const image = ogImagePath("page", "react-native");
    const metadata: Metadata = {
      title,
      description,
      keywords: [
        "react native components",
        "animated react native components",
        "expo components",
        "react native ui library",
        "reanimated components",
        "react native animation",
      ],
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: NATIVE_PATH,
        locale: "en_US",
        siteName: "beUI",
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · beUI`,
        description,
        images: [image],
      },
      alternates: {
        canonical: NATIVE_PATH,
        types: { "application/json": "/native/r" },
      },
    };
    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: "beUI", path: "/" },
        { name: "React Native", path: NATIVE_PATH },
      ]),
      nativeIndexJsonLd(),
    ];
    return { metadata, jsonLd, newComponents, groups };
  });

export type NativeIndexPageData = Awaited<ReturnType<typeof getNativeIndexPage>>;

const link =
  "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground";

export function NativeIndexPage({ data }: { data: NativeIndexPageData }) {
  const t = useTranslations("Native.index");
  return (
    <div>
      <JsonLd data={data.jsonLd} />
      <nav aria-label={t("breadcrumb")} className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">React Native</span>
      </nav>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{t("intro")}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {t.rich("setup", {
          link: (chunks) => (
            <Link href="/docs/native-setup" className={link}>
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>
      <InstallCommand tool="beui-native" slugs={nativeSlugs} className="mt-6 max-w-2xl" />

      <div className="mt-12 space-y-12">
        {data.newComponents.length ? (
          <section aria-labelledby="native-new">
            <h2
              id="native-new"
              className="font-display text-xs font-medium uppercase text-muted-foreground"
            >
              {t("new")}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.newComponents.map((component) => (
                <ComponentCard
                  key={component.slug}
                  categorySlug="motion"
                  slug={component.slug}
                  name={component.title}
                  description={component.description}
                  href={nativeComponentPath(component.slug)}
                  badge="new"
                  launchedAt={component.launchedAt}
                />
              ))}
            </div>
          </section>
        ) : null}
        <ProBlocksSection pageKey="react-native" heading="mobile" />
        {data.groups.map((group) => (
          <section key={group.id} aria-labelledby={group.id}>
            <h2
              id={group.id}
              className="font-display text-xs font-medium uppercase text-muted-foreground"
            >
              {group.label}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.components.map((component) => (
                <ComponentCard
                  key={component.slug}
                  categorySlug="motion"
                  slug={component.slug}
                  name={component.title}
                  description={component.description}
                  href={nativeComponentPath(component.slug)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// /react-native/<slug>
// ---------------------------------------------------------------------------

/**
 * The web category a native component shares its slug with. Charts and
 * Casino pages have no Web/React Native switch, so their slugs don't count.
 */
function webCategoryOf(slug: string) {
  return registry.find(
    (cat) =>
      !TOP_LEVEL_CATEGORIES.includes(cat.slug) && cat.components.some((c) => c.slug === slug),
  );
}

const langFor = (file: string) => (file.endsWith(".tsx") ? "tsx" : "ts");

async function nativePanelCode(component: NativeComponent): Promise<NativePanelCode> {
  const commands = nativeInstallCommands(component);
  const files = (list: NativeComponent["files"]) =>
    Promise.all(
      list.map((file) => highlight(file.content, { lang: langFor(file.path), filename: file.path })),
    );
  const [libraries, theme, shared, own] = await Promise.all([
    commands.length > 0 ? highlight(commands.join("\n"), { lang: "bash" }) : null,
    highlight(native.theme.content, { lang: "css", filename: native.theme.path }),
    files(component.shared),
    files(component.files),
  ]);
  return {
    libraries,
    gestures: component.libraries.includes("react-native-gesture-handler"),
    theme,
    shared,
    files: own,
  };
}

async function readmeBlocks(markdown: string): Promise<NativeReadmeBlock[]> {
  return Promise.all(
    parseNativeReadme(markdown).map(async (block) =>
      block.type === "code"
        ? { type: "code" as const, code: await highlight(block.code, { lang: block.lang || "tsx" }) }
        : block,
    ),
  );
}

export const getNativeComponentPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((input: { slug: string }) => input)
  .handler(async ({ data: { slug } }) => {
    const component = findNativeComponent(slug);
    if (!component) return null;
    const t = getTranslations("Native.component");

    const title = t("metaTitle", { name: component.title });
    const description = clampText(
      t("metaDescription", { description: component.description }),
      160,
    );
    const path = nativeComponentPath(slug);
    const image = ogImagePath("native", slug);
    const metadata: Metadata = {
      title,
      description,
      keywords: [
        `react native ${component.title.toLowerCase()}`,
        `${component.title.toLowerCase()} component react native`,
        "react native components",
        "expo components",
        "reanimated",
        "animated react native",
      ],
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: path,
        locale: "en_US",
        type: "article",
        siteName: "beUI",
        images: [
          { url: image, width: 1200, height: 630, alt: t("ogAlt", { name: component.title }) },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · beUI`,
        description,
        images: [image],
      },
      alternates: {
        canonical: path,
        types: { "application/json": `/native/r/${slug}` },
      },
    };

    const category = webCategoryOf(slug);
    // Related native components, picked like the web page's related ones.
    const related: RelatedItem[] = category
      ? relatedComponents(category.slug, slug, 3, (other) =>
          Boolean(findNativeComponent(other)),
        ).flatMap((rel) => {
          const nativeRel = findNativeComponent(rel.slug);
          return nativeRel
            ? [
                {
                  category: rel.category,
                  slug: rel.slug,
                  name: nativeRel.title,
                  description: nativeRel.description,
                  href: nativeComponentPath(rel.slug),
                },
              ]
            : [];
        })
      : [];

    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: "beUI", path: "/" },
        { name: "React Native", path: NATIVE_PATH },
        { name: component.title, path: nativeComponentPath(slug) },
      ]),
      nativeComponentJsonLd(component),
    ];

    const [code, readme] = await Promise.all([
      nativePanelCode(component),
      component.readme ? readmeBlocks(component.readme) : null,
    ]);

    return {
      metadata,
      jsonLd,
      component: {
        slug: component.slug,
        title: component.title,
        description: component.description,
        clips: component.clips,
        repository: component.repository,
      },
      code,
      readme,
      webCategory: category?.slug ?? null,
      related,
    };
  });

export type NativeComponentPageData = NonNullable<
  Awaited<ReturnType<typeof getNativeComponentPage>>
>;

export async function loadNativeComponentPage(input: { slug: string }) {
  const data = await getNativeComponentPage({ data: input });
  if (!data) throw notFound();
  return data;
}

export function NativeComponentPage({ data }: { data: NativeComponentPageData }) {
  const t = useTranslations("Native");
  const { component } = data;
  return (
    <div>
      <JsonLd data={data.jsonLd} />
      <nav aria-label={t("index.breadcrumb")} className="flex items-center gap-1.5 text-sm">
        <Link
          href={NATIVE_PATH}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          React Native
        </Link>
        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground">{component.title}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {component.title}
        </h1>
        <span className="mt-1 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          React Native
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">{component.description}</p>

      {/* Wide screens pick the platform from the right sidebar. */}
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>

      <NativePanel component={component} code={data.code} />

      {data.readme ? (
        <section
          id="native-docs"
          aria-labelledby="native-docs-heading"
          className="mt-12 scroll-mt-24 border-t border-border pt-8"
        >
          <h2 id="native-docs-heading" className="text-sm font-semibold text-foreground">
            {t("component.documentation")}
          </h2>
          <div className="mt-4">
            <NativeReadme blocks={data.readme} />
          </div>
        </section>
      ) : null}

      {data.webCategory ? (
        <Link
          href={componentPath(data.webCategory, component.slug)}
          className="group mt-12 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Globe aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">{t("component.webTitle")}</span>{" "}
            <span className="text-muted-foreground">
              {t("component.webDescription", { name: component.title })}
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
      <RelatedSection related={data.related} />
    </div>
  );
}
