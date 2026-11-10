import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import { metadataToHead } from "@/lib/head";
import { CategoryPage, loadCategoryPage } from "../../../-pages/category-page";

export const Route = createFileRoute("/{-$locale}/components/$category/")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    // Charts and casino list at /charts and /casino.
    if (!locale || TOP_LEVEL_CATEGORIES.includes(params.category)) throw notFound();
    return loadCategoryPage({ locale, category: params.category });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <CategoryPage data={Route.useLoaderData()} />;
  },
});
