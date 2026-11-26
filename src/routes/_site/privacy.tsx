import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getPrivacyPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/privacy")({
  loader: () => getPrivacyPage(),
  head: loaderHead,
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
