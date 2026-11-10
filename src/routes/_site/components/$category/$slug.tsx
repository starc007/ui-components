import { createFileRoute, notFound } from "@tanstack/react-router";
import { TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import { metadataToHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../../-pages/component-page";

export const Route = createFileRoute("/_site/components/$category/$slug")({
  loader: ({ params }) => {
    // Charts and casino pages live at /charts/<slug> and /casino/<slug>.
    if (TOP_LEVEL_CATEGORIES.includes(params.category)) throw notFound();
    return loadComponentPage({ category: params.category, slug: params.slug });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
