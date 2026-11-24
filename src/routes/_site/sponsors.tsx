import { createFileRoute } from "@tanstack/react-router";
import { loaderHead } from "@/lib/head";
import { PageMessages } from "../-pages/page-messages";
import { getSponsorsPage, SponsorsPage } from "../-pages/sponsors-page";

export const Route = createFileRoute("/_site/sponsors")({
  loader: () => getSponsorsPage(),
  head: loaderHead,
  component: function Page() {
    const data = Route.useLoaderData();
    return (
      <PageMessages page="sponsors" messages={data.messages}>
        <SponsorsPage />
      </PageMessages>
    );
  },
});
