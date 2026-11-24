import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { SeoPage } from "@/components/app/docs/seo-page";
import { loaderHead } from "@/lib/head";
import { loadSeoLandingPage } from "../../-pages/seo-landing-page";

export const Route = createFileRoute("/_site/alternatives/$slug")({
  loader: ({ params }) => loadSeoLandingPage({ kind: "alternatives", slug: params.slug }),
  head: loaderHead,
  component: function Page() {
    const { kind, page, codes } = Route.useLoaderData();
    return (
      <>
        <SeoPage kind={kind} page={page} codes={codes} />
        <SiteFooter />
      </>
    );
  },
});
