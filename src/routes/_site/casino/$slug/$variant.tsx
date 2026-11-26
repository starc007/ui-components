import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { loadVariantPage, VariantPage } from "../../../-pages/variant-page";

export const Route = createFileRoute("/_site/casino/$slug/$variant")({
  loader: ({ params }) =>
    loadVariantPage({ category: "casino", slug: params.slug, variant: params.variant }),
  head: loaderHead,
  component: function Page() {
    return <VariantPage data={Route.useLoaderData()} />;
  },
});
