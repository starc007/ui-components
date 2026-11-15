import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { messages } from "@/i18n/messages";
import type { Metadata } from "@/lib/head";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalPageData = {
  metadata: Metadata;
  heading: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

type LegalKey = "privacy" | "terms";

/**
 * Legal copy lives in `Pages.privacy` and `Pages.terms`. It never reaches the
 * client messages: the page's static server function returns it as data.
 */
function legalPage(key: LegalKey): LegalPageData {
  const page = messages.Pages[key];
  const path = `/${key}`;
  const title = `${page.meta.title} · beUI`;
  return {
    metadata: {
      title: page.meta.title,
      description: page.meta.description,
      alternates: { canonical: path },
      openGraph: {
        title,
        description: page.meta.description,
        url: path,
        locale: "en_US",
        type: "website",
        siteName: "beUI",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: { card: "summary_large_image", title, images: [DEFAULT_OG_IMAGE] },
    },
    heading: page.heading,
    updated: page.updated,
    intro: page.intro,
    sections: page.sections,
  };
}

export const getPrivacyPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => legalPage("privacy"));

export const getTermsPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => legalPage("terms"));

export function LegalPage({ data }: { data: LegalPageData }) {
  return (
    <>
      <article className="mx-auto min-w-0 max-w-3xl px-4 py-16">
        <header>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{data.heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{data.updated}</p>
          <p className="mt-6 leading-7 text-muted-foreground">{data.intro}</p>
        </header>
        {data.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-xl font-medium tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
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
          </section>
        ))}
      </article>
      <SiteFooter />
    </>
  );
}
