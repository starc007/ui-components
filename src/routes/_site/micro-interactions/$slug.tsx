import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../-pages/component-page";

export const Route = createFileRoute("/_site/micro-interactions/$slug")({
  loader: ({ params }) => loadComponentPage({ category: "micro-interactions", slug: params.slug }),
  head: loaderHead,
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
