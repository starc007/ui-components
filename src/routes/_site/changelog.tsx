import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { getTranslations } from "@/i18n/server";
import { CHANGELOG_FEED_PATH, CHANGELOG_PATH } from "@/lib/changelog";
import { type Metadata, metadataToHead } from "@/lib/head";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";

const getChangelogPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Native.changelog");
    const description = t("description");
    const metadata: Metadata = {
      title: t("title"),
      description,
      alternates: {
        canonical: CHANGELOG_PATH,
        types: { "application/rss+xml": CHANGELOG_FEED_PATH },
      },
      openGraph: {
        title: `${t("title")} · beUI`,
        description,
        url: CHANGELOG_PATH,
        type: "website",
        siteName: "beUI",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: `${t("title")} · beUI`,
        images: [DEFAULT_OG_IMAGE],
      },
    };
    return { metadata };
  });

export const Route = createFileRoute("/_site/changelog")({
  loader: () => getChangelogPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: ChangelogPage,
});

function ChangelogPage() {
  return (
    <>
      <ChangelogContent />
      <SiteFooter />
    </>
  );
}
