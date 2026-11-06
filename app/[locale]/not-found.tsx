import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";
import { type Locale, localizedPath } from "@/i18n/routing";

// not-found gets no params; the locale comes from the request.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Chrome.notFound");
  return { title: t("title"), description: t("description") };
}

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Chrome.notFound");
  return (
    <NotFoundGlitch
      title={t("title")}
      description={t("description")}
      homeHref={localizedPath("/", locale)}
      homeLabel={t("homeLabel")}
      browseHref={localizedPath("/components/motion", locale)}
      browseLabel={t("browseLabel")}
    />
  );
}
