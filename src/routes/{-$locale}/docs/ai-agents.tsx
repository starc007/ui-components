import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { AIAgentsPage, getAIAgentsPage } from "../../-pages/ai-agents";

export const Route = createFileRoute("/{-$locale}/docs/ai-agents")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getAIAgentsPage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <AIAgentsPage data={Route.useLoaderData()} />;
  },
});
