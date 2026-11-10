import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { Playground } from "@/components/app/playground/playground";
import { localeAlternates } from "@/i18n/metadata";
import { type Locale, localeFromParam } from "@/i18n/routing";
import { getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";

const getPlaygroundPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const t = await getTranslations({ locale, namespace: "Pages.playground.meta" });
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: localeAlternates("/playground", locale),
    };
    return { metadata };
  });

export const Route = createFileRoute("/{-$locale}/playground")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getPlaygroundPage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: Playground,
});
