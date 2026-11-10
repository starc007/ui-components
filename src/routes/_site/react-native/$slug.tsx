import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { loadNativeComponentPage, NativeComponentPage } from "../../-pages/native-pages";

export const Route = createFileRoute("/_site/react-native/$slug")({
  loader: ({ params }) => loadNativeComponentPage({ slug: params.slug }),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeComponentPage data={Route.useLoaderData()} />;
  },
});
