import { createFileRoute, notFound } from "@tanstack/react-router";
import { TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import { loaderHead } from "@/lib/head";
import { CategoryPage, loadCategoryPage } from "../../../-pages/category-page";

export const Route = createFileRoute("/_site/components/$category/")({
  loader: ({ params }) => {
    // Charts and casino list at /charts and /casino.
    if (TOP_LEVEL_CATEGORIES.includes(params.category)) throw notFound();
    return loadCategoryPage({ category: params.category });
  },
  head: loaderHead,
  component: function Page() {
    return <CategoryPage data={Route.useLoaderData()} />;
  },
});
