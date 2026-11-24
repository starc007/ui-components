import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { CategoryPage, loadCategoryPage } from "../../-pages/category-page";

export const Route = createFileRoute("/_site/casino/")({
  loader: () => loadCategoryPage({ category: "casino" }),
  head: loaderHead,
  component: function Page() {
    return <CategoryPage data={Route.useLoaderData()} />;
  },
});
