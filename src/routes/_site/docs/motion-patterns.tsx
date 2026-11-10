import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useTranslations } from "use-intl";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { MotionPatterns } from "@/components/app/docs/motion-patterns";
import { getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/docs/motion-patterns";

const getMotionPatternsMetadata = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<{ metadata: Metadata }> => {
    const t = getTranslations("Pages.motionPatterns.meta");
    return {
      metadata: {
        title: t("title"),
        description: t("description"),
        alternates: {
          canonical: PAGE_PATH,
          types: { "text/markdown": `${PAGE_PATH}.md` },
        },
        openGraph: {
          title: `${t("title")} · beUI`,
          description: t("ogDescription"),
          url: PAGE_PATH,
          locale: "en_US",
          type: "article",
          siteName: "beUI",
          images: [DEFAULT_OG_IMAGE],
        },
        twitter: {
          card: "summary_large_image",
          title: `${t("title")} · beUI`,
          images: [DEFAULT_OG_IMAGE],
        },
      },
    };
  });

export const Route = createFileRoute("/_site/docs/motion-patterns")({
  loader: () => getMotionPatternsMetadata(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: MotionPatternsPage,
});

function MotionPatternsPage() {
  // Pages.motionPatterns ships in the client messages.
  const t = useTranslations("Pages.motionPatterns");

  return (
    <GuideShell>
      <header
        id="overview"
        className="scroll-mt-24 border-b border-border pb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("header.eyebrow")}
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {t("header.title")}
          </h1>
          <CopyPage
            pageUrl={`${SITE_URL}${PAGE_PATH}`}
            markdownPath={`${PAGE_PATH}.md`}
            componentName="Motion Guides"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("header.intro")}
        </p>
      </header>

      <MotionPatterns />
    </GuideShell>
  );
}
