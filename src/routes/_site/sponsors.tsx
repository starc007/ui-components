import { createFileRoute } from "@tanstack/react-router";
import { metadataToHead } from "@/lib/head";
import { getSponsorsPage, SponsorsPage } from "../-pages/sponsors-page";

export const Route = createFileRoute("/_site/sponsors")({
  loader: () => getSponsorsPage(),
  head: ({ loaderData }) => (loaderData ? metadataToHead(loaderData.metadata) : {}),
  component: SponsorsPage,
});
