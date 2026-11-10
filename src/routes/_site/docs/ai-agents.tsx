import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { AIAgentsPage, getAIAgentsPage } from "../../-pages/ai-agents";

export const Route = createFileRoute("/_site/docs/ai-agents")({
  loader: () => getAIAgentsPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <AIAgentsPage data={Route.useLoaderData()} />;
  },
});
