import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { loadNativeComponentPage, NativeComponentPage } from "../../-pages/native-pages";

export const Route = createFileRoute("/{-$locale}/react-native/$slug")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return loadNativeComponentPage({ locale, slug: params.slug });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeComponentPage data={Route.useLoaderData()} />;
  },
});
