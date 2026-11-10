import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { ComponentPage, loadComponentPage } from "../../-pages/component-page";

export const Route = createFileRoute("/{-$locale}/casino/$slug")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return loadComponentPage({ locale, category: "casino", slug: params.slug });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ComponentPage data={Route.useLoaderData()} />;
  },
});
