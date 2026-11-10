import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getNativeIndexPage, NativeIndexPage } from "../../-pages/native-pages";

export const Route = createFileRoute("/_site/react-native/")({
  loader: () => getNativeIndexPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeIndexPage data={Route.useLoaderData()} />;
  },
});
