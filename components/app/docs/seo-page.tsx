import { ArrowUpRight } from "lucide-react";
import { useFormatter, useLocale, useMessages, useTranslations } from "next-intl";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { ComponentCard } from "@/components/app/docs/component-card";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { localizeComponent } from "@/i18n/catalog";
import { allComponents } from "@/lib/registry";
import { breadcrumbJsonLd, docsArticleJsonLd, faqJsonLd } from "@/lib/seo";
import { seoPagePath } from "@/lib/seo-pages";
import type { AlternativePage, SeoPage as SeoPageData, SeoPageKind } from "@/lib/seo-pages/types";

export function sectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Shared body for alternatives and guides landing pages. The chrome follows
 * the locale; the article itself is English only, marked `lang="en"`.
 */
export function SeoPage({
  kind,
  page,
}: {
  kind: SeoPageKind;
  page: SeoPageData | AlternativePage;
}) {
  const t = useTranslations("Native.article");
  const format = useFormatter();
  const locale = useLocale();
  const messages = useMessages();
  const english = locale === "en" ? undefined : "en";
  const path = seoPagePath(kind, page.slug);
  const comparison = "comparison" in page ? page : null;
  const components = page.components.flatMap((slug) => {
    const component = allComponents().find((item) => item.slug === slug);
    return component ? [localizeComponent(component, messages)] : [];
  });

  return (
    <GuideShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: "/" },
            { name: page.heading, path },
          ]),
          docsArticleJsonLd({
            path,
            headline: page.title,
            description: page.description,
            image: `/api/og?${kind === "guides" ? "guide" : "alternative"}=${page.slug}`,
            datePublished: page.publishedAt,
            dateModified: page.updatedAt,
          }),
          faqJsonLd(path, page.faq),
        ]}
      />
      <header id="overview" className="scroll-mt-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {kind === "guides" ? t("guide") : t("comparison")}
        </p>
        <h1 lang={english} className="mt-2 text-3xl font-medium tracking-tight text-foreground">{page.heading}</h1>
        <p lang={english} className="mt-3 max-w-2xl text-muted-foreground">
          {page.intro}
        </p>
      </header>

      {comparison ? (
        <section id="comparison" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            {t("versus", { competitor: comparison.competitor })}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border text-foreground">
                <tr>
                  <th scope="col" className="w-1/4 px-4 py-3 font-medium">
                    <span className="sr-only">{t("feature")}</span>
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">beUI</th>
                  <th scope="col" className="px-4 py-3 font-medium">{comparison.competitor}</th>
                </tr>
              </thead>
              <tbody lang={english} className="divide-y divide-border text-muted-foreground">
                {comparison.comparison.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-4 py-3 align-top font-medium text-foreground">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 align-top">{row.beui}</td>
                    <td className="px-4 py-3 align-top">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href={comparison.competitorUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {t("officialSite", { competitor: comparison.competitor })}
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </a>
        </section>
      ) : null}

      <div lang={english}>
      {page.sections.map((section) => (
        <section key={section.heading} id={sectionId(section.heading)} className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-medium tracking-tight text-foreground">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-7 text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {section.list?.length ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-7 text-muted-foreground">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.code ? (
            <div className="mt-4">
              <CodeBlock code={section.code.code} lang={section.code.lang} filename={section.code.filename} />
            </div>
          ) : null}
        </section>
      ))}
      </div>

      {components.length ? (
        <section id="components" className="mt-12 scroll-mt-24 border-t border-border pt-8">
          <h2 className="text-xl font-medium tracking-tight text-foreground">{t("components")}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {components.map((component) => (
              <ComponentCard
                key={component.slug}
                categorySlug={component.category.slug}
                slug={component.slug}
                name={component.name}
                description={component.description}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id="faq" className="mt-12 scroll-mt-24 border-t border-border pt-8">
        <h2 className="text-xl font-medium tracking-tight text-foreground">{t("faq")}</h2>
        <dl lang={english} className="mt-4 space-y-5">
          {page.faq.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-1 leading-7 text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        {t.rich("updated", {
          time: () => (
            <time dateTime={page.updatedAt}>
              {format.dateTime(new Date(`${page.updatedAt}T00:00:00Z`), {
                dateStyle: "medium",
                timeZone: "UTC",
              })}
            </time>
          ),
        })}
      </p>
    </GuideShell>
  );
}
