import { ArrowRight, ChevronRight, Globe } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { NativePanel } from "@/components/app/docs/native/native-panel";
import { NativeReadme } from "@/components/app/docs/native/native-readme";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { RelatedSection } from "@/components/app/docs/related-section";
import {
  componentPath,
  NATIVE_PATH,
  nativeComponentPath,
} from "@/lib/component-paths";
import { findNativeComponent, native } from "@/lib/native";
import {
  nativeComponentJsonLd,
  nativeMetaDescription,
  nativeTitle,
} from "@/lib/native-seo";
import { registry } from "@/lib/registry";
import { breadcrumbJsonLd, relatedComponents } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return native.components.map((component) => ({ slug: component.slug }));
}

/** The web category a native component shares its slug with. */
function webCategoryOf(slug: string) {
  return registry.find(
    (cat) => cat.slug !== "charts" && cat.components.some((c) => c.slug === slug),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const component = findNativeComponent(slug);
  if (!component) return {};
  const title = nativeTitle(component);
  const description = nativeMetaDescription(component);
  const url = nativeComponentPath(slug);
  const image = `/api/og?native=${slug}`;
  return {
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
      url,
      type: "article",
      siteName: "beUI",
      images: [{ url: image, width: 1200, height: 630, alt: `${component.title} for React Native` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · beUI`,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
      types: { "application/json": `/native/r/${slug}` },
    },
  };
}

export default async function NativeComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = findNativeComponent(slug);
  if (!component) notFound();
  const category = webCategoryOf(slug);
  // Related native components, picked like the web page's related ones.
  const related = category
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

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: "React Native", path: NATIVE_PATH },
            { name: component.title, path: nativeComponentPath(slug) },
          ]),
          nativeComponentJsonLd(component),
        ]}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
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

      <NativePanel component={component} />

      {component.readme ? (
        <section
          id="native-docs"
          aria-labelledby="native-docs-heading"
          className="mt-12 scroll-mt-24 border-t border-border pt-8"
        >
          <h2 id="native-docs-heading" className="text-sm font-semibold text-foreground">
            Documentation
          </h2>
          <div className="mt-4">
            <NativeReadme markdown={component.readme} />
          </div>
        </section>
      ) : null}

      {category ? (
        <Link
          href={componentPath(category.slug, slug)}
          className="group mt-12 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Globe aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">Also on the web.</span>{" "}
            <span className="text-muted-foreground">
              The React version of {component.title}, built with Motion and Tailwind CSS.
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
      <RelatedSection related={related} />
    </div>
  );
}
