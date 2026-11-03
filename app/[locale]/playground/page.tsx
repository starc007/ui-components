import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Playground } from "@/components/app/playground/playground";
import { localeAlternates } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Pages.playground.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates("/playground", locale),
  };
}

export default async function PlaygroundPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <Playground />;
}
