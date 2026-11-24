import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { CategoryPage, loadCategoryPage } from "../../-pages/category-page";

export const Route = createFileRoute("/_site/sounds/")({
  loader: () => loadCategoryPage({ category: "sounds" }),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <CategoryPage data={Route.useLoaderData()} />;
  },
});
