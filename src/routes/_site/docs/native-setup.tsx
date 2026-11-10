import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getNativeSetupPage, NativeSetupPage } from "../../-pages/native-setup";

export const Route = createFileRoute("/_site/docs/native-setup")({
  loader: () => getNativeSetupPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <NativeSetupPage data={Route.useLoaderData()} />;
  },
});
