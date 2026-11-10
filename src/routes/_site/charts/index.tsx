import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { CategoryPage, loadCategoryPage } from "../../-pages/category-page";

export const Route = createFileRoute("/_site/charts/")({
  loader: () => loadCategoryPage({ category: "charts" }),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <CategoryPage data={Route.useLoaderData()} />;
  },
});
