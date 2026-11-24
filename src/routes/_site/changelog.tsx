import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { getTranslations } from "@/i18n/server";
import { CHANGELOG_FEED_PATH, CHANGELOG_PATH } from "@/lib/changelog";
import { loaderHead, pageMetadata } from "@/lib/head";

const getChangelogPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Native.changelog");
    const metadata = pageMetadata({
      path: CHANGELOG_PATH,
      title: t("title"),
      description: t("description"),
      types: { "application/rss+xml": CHANGELOG_FEED_PATH },
    });
    return { metadata };
  });

export const Route = createFileRoute("/_site/changelog")({
  loader: () => getChangelogPage(),
  head: loaderHead,
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
