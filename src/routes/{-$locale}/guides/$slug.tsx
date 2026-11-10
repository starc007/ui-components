import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoPage } from "@/components/app/docs/seo-page";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";
import { loadSeoLandingPage } from "../../-pages/seo-landing-page";

export const Route = createFileRoute("/{-$locale}/guides/$slug")({
  loader: ({ params }) => {
    if (!localeFromParam(params.locale)) throw notFound();
    return loadSeoLandingPage({ kind: "guides", slug: params.slug });
  },
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: function Page() {
    const { kind, page, codes } = Route.useLoaderData();
    return <SeoPage kind={kind} page={page} codes={codes} />;
  },
});
