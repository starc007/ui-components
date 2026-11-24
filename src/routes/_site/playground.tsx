import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { Playground } from "@/components/app/playground/playground";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";
import { PageMessages } from "../-pages/page-messages";

const getPlaygroundPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.playground.meta");
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: { canonical: "/playground" },
    };
    return { metadata, messages: messages.Pages.playground };
  });

export const Route = createFileRoute("/_site/playground")({
  loader: () => getPlaygroundPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function PlaygroundPage() {
    const data = Route.useLoaderData();
    return (
      <PageMessages page="playground" messages={data.messages}>
        <Playground />
      </PageMessages>
    );
  },
});
