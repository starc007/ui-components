import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { getNativeIndexPage, NativeIndexPage } from "../../-pages/native-pages";

export const Route = createFileRoute("/{-$locale}/react-native/")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getNativeIndexPage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeIndexPage data={Route.useLoaderData()} />;
  },
});
