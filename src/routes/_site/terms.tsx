import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getTermsPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/terms")({
  loader: () => getTermsPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
