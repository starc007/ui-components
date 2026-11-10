import { createFileRoute, notFound } from "@tanstack/react-router";
import { redirect } from "@/i18n/navigation";
import { localeFromParam } from "@/i18n/routing";

export const Route = createFileRoute("/{-$locale}/components/")({
  beforeLoad: ({ params }) => {
    const locale = localeFromParam(params.locale);
    if (!locale) throw notFound();
    redirect({ href: "/components/motion", locale });
  },
});
