import { createFileRoute, notFound } from "@tanstack/react-router";
import { LandingShowcase } from "@/components/app/landing/home/landing-showcase";
import { localeAlternates } from "@/i18n/metadata";
import { localeFromParam } from "@/i18n/routing";
import { metadataToHead } from "@/lib/head";

export const Route = createFileRoute("/{-$locale}/")({
  beforeLoad: ({ params }) => {
    if (!localeFromParam(params.locale)) throw notFound();
  },
  head: ({ params }) =>
    metadataToHead({ alternates: localeAlternates("/", localeFromParam(params.locale) ?? "en") }),
  component: LandingShowcase,
});
