import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { SeoIndexPage } from "@/components/app/docs/seo-index-page";
import { metadataToHead } from "@/lib/head";
import { getSeoIndexPage } from "../../-pages/seo-landing-page";

export const Route = createFileRoute("/_site/guides/")({
  loader: () => getSeoIndexPage({ data: "guides" }),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    return (
      <>
        <SeoIndexPage kind="guides" />
        <SiteFooter />
      </>
    );
  },
});
