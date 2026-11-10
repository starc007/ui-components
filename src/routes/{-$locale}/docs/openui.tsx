import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { getOpenUIPage, OpenUIPage } from "../../-pages/openui";

export const Route = createFileRoute("/{-$locale}/docs/openui")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getOpenUIPage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <OpenUIPage data={Route.useLoaderData()} />;
  },
});
