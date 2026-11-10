import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { TOP_LEVEL_CATEGORIES } from "@/lib/component-paths";
import { metadataToHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../../-pages/component-page";

export const Route = createFileRoute("/{-$locale}/components/$category/$slug")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    // Charts and casino pages live at /charts/<slug> and /casino/<slug>.
    if (!locale || TOP_LEVEL_CATEGORIES.includes(params.category)) throw notFound();
    return loadComponentPage({ locale, category: params.category, slug: params.slug });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
