import { createFileRoute, notFound } from "@tanstack/react-router";
import { TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import { loaderHead } from "@/lib/head";
import { loadVariantPage, VariantPage } from "../../../../-pages/variant-page";

export const Route = createFileRoute("/_site/components/$category/$slug/$variant")({
  loader: ({ params }) => {
    // Charts and casino variants live under /charts and /casino.
    if (TOP_LEVEL_CATEGORIES.includes(params.category)) throw notFound();
    return loadVariantPage({
      category: params.category,
      slug: params.slug,
      variant: params.variant,
    });
  },
  head: loaderHead,
  component: function Page() {
    return <VariantPage data={Route.useLoaderData()} />;
  },
});
