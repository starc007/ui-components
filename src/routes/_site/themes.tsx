import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { ThemeStudio } from "@/components/app/themes/theme-studio";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import { PageMessages } from "../-pages/page-messages";

const PAGE_PATH = "/themes";

const getThemesPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.themes.meta");
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: { canonical: PAGE_PATH },
      openGraph: {
        title: `${t("title")} · beUI`,
        description: t("description"),
        url: PAGE_PATH,
        locale: "en_US",
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
    return { metadata, messages: messages.Pages.themes };
  });

export const Route = createFileRoute("/_site/themes")({
  loader: () => getThemesPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
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
