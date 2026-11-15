import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getPrivacyPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/privacy")({
  loader: () => getPrivacyPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
