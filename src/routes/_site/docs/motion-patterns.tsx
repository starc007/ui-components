import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useTranslations } from "use-intl";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { MotionPatterns } from "@/components/app/docs/motion-patterns";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import { loaderHead, pageMetadata } from "@/lib/head";
import { SITE_URL } from "@/lib/site";
import { PageMessages } from "../../-pages/page-messages";

const PAGE_PATH = "/docs/motion-patterns";

const getMotionPatternsPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.motionPatterns.meta");
    const metadata = pageMetadata({
      path: PAGE_PATH,
      title: t("title"),
      description: t("description"),
      ogDescription: t("ogDescription"),
      type: "article",
      types: { "text/markdown": `${PAGE_PATH}.md` },
    });
    return { metadata, messages: messages.Pages.motionPatterns };
  });

export const Route = createFileRoute("/_site/docs/motion-patterns")({
  loader: () => getMotionPatternsPage(),
  head: loaderHead,
  component: function Page() {
    const data = Route.useLoaderData();
    return (
      <PageMessages page="motionPatterns" messages={data.messages}>
        <MotionPatternsPage />
      </PageMessages>
    );
  },
});

function MotionPatternsPage() {
  const t = useTranslations("Pages.motionPatterns");

  return (
    <GuideShell>
      <header
        id="overview"
        className="scroll-mt-24 border-b border-border pb-10"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
