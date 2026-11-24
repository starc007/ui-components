import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../-pages/component-page";

export const Route = createFileRoute("/_site/charts/$slug")({
  loader: ({ params }) => loadComponentPage({ category: "charts", slug: params.slug }),
  head: loaderHead,
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
