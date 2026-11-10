import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../-pages/component-page";

export const Route = createFileRoute("/_site/casino/$slug")({
  loader: ({ params }) => loadComponentPage({ category: "casino", slug: params.slug }),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
