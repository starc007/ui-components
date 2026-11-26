import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { getRefundsPage, LegalPage } from "../-pages/legal-page";

export const Route = createFileRoute("/_site/refunds")({
  loader: () => getRefundsPage(),
  head: loaderHead,
  component: function Page() {
    return <LegalPage data={Route.useLoaderData()} />;
  },
});
