import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getTermsPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/terms")({
  loader: () => getTermsPage(),
  head: loaderHead,
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
