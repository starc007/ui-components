import { createFileRoute } from "@tanstack/react-router";
import { LandingShowcase } from "@/components/app/landing/home/landing-showcase";
import { metadataToHead } from "@/lib/head";

export const Route = createFileRoute("/_site/")({
  head: () => metadataToHead({ alternates: { canonical: "/" } }),
  component: LandingShowcase,
});
