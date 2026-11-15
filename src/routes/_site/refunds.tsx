import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getRefundsPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/refunds")({
  loader: () => getRefundsPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
