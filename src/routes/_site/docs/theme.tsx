import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getThemePage, ThemePage } from "../../-pages/theme";

export const Route = createFileRoute("/_site/docs/theme")({
  loader: () => getThemePage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <ThemePage data={Route.useLoaderData()} />;
  },
});
