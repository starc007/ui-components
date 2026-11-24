import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { ThemeStudio } from "@/components/app/themes/theme-studio";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import { loaderHead, pageMetadata } from "@/lib/head";
import { PageMessages } from "../-pages/page-messages";

const PAGE_PATH = "/themes";

const getThemesPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.themes.meta");
    const metadata = pageMetadata({
      path: PAGE_PATH,
      title: t("title"),
      description: t("description"),
    });
    return { metadata, messages: messages.Pages.themes };
  });

export const Route = createFileRoute("/_site/themes")({
  loader: () => getThemesPage(),
  head: loaderHead,
  component: function Page() {
    const data = Route.useLoaderData();
    return (
      <PageMessages page="themes" messages={data.messages}>
        <ThemeStudio />
        <SiteFooter />
      </PageMessages>
    );
  },
});
