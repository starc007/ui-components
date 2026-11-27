import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { getTranslations } from "@/i18n/server";
import { loaderHead, pageMetadata } from "@/lib/head";
import { BrandPage } from "../-pages/brand-page";

const PAGE_PATH = "/brand";

const getBrandPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.brand.meta");
    const metadata = pageMetadata({
      path: PAGE_PATH,
      title: t("title"),
      description: t("description"),
    });
    return { metadata };
  });

export const Route = createFileRoute("/_site/brand")({
  loader: () => getBrandPage(),
  head: loaderHead,
  component: function Page() {
    return (
      <>
        <BrandPage />
        <SiteFooter />
      </>
    );
  },
});
