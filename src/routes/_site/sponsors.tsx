import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { PageMessages } from "../-pages/page-messages";
import { getSponsorsPage, SponsorsPage } from "../-pages/sponsors-page";

export const Route = createFileRoute("/_site/sponsors")({
  loader: () => getSponsorsPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    const data = Route.useLoaderData();
    return (
      <PageMessages page="sponsors" messages={data.messages}>
        <SponsorsPage />
      </PageMessages>
    );
  },
});
