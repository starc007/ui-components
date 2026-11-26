import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { AIAgentsPage, getAIAgentsPage } from "../../-pages/ai-agents";

export const Route = createFileRoute("/_site/docs/ai-agents")({
  loader: () => getAIAgentsPage(),
  head: loaderHead,
  component: function Page() {
    return <AIAgentsPage data={Route.useLoaderData()} />;
  },
});
