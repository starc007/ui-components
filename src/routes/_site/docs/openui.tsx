import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getOpenUIPage, OpenUIPage } from "../../-pages/openui";

export const Route = createFileRoute("/_site/docs/openui")({
  loader: () => getOpenUIPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <OpenUIPage data={Route.useLoaderData()} />;
  },
});
