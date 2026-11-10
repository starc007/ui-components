import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { getThemePage, ThemePage } from "../../-pages/theme";

export const Route = createFileRoute("/{-$locale}/docs/theme")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getThemePage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ThemePage data={Route.useLoaderData()} />;
  },
});
