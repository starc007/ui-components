import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default async function ComponentsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({
    href: "/components/motion",
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  });
}
