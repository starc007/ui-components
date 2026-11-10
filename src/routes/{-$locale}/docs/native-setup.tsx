import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { getNativeSetupPage, NativeSetupPage } from "../../-pages/native-setup";

export const Route = createFileRoute("/{-$locale}/docs/native-setup")({
  loader: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    return getNativeSetupPage({ data: locale });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeSetupPage data={Route.useLoaderData()} />;
  },
});
