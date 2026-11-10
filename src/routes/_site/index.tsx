import { createFileRoute } from "@tanstack/react-router";
import { LandingShowcase } from "@/components/app/landing/home/landing-showcase";
import { metadataToHead } from "@/lib/head";
import { getHomePage } from "../-pages/home";

export const Route = createFileRoute("/_site/")({
  loader: () => getHomePage(),
  head: () => metadataToHead({ alternates: { canonical: "/" } }),
  component: HomePage,
});

function HomePage() {
  const { phones } = Route.useLoaderData();
  return <LandingShowcase phones={phones} />;
}
