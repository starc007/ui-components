import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { SeoIndexPage } from "@/components/app/docs/seo-index-page";
import { loaderHead } from "@/lib/head";
import { getSeoIndexPage } from "../../-pages/seo-landing-page";

export const Route = createFileRoute("/_site/alternatives/")({
  loader: () => getSeoIndexPage({ data: "alternatives" }),
  head: loaderHead,
  component: function Page() {
    return (
      <>
        <SeoIndexPage kind="alternatives" />
        <SiteFooter />
      </>
    );
  },
});
