import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { Playground } from "@/components/app/playground/playground";
import { getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";

const getPlaygroundPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.playground.meta");
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: { canonical: "/playground" },
    };
    return { metadata };
  });

export const Route = createFileRoute("/_site/playground")({
  loader: () => getPlaygroundPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: Playground,
});
