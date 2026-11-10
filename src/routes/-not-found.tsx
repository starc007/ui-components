import { useLocale, useTranslations } from "use-intl";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";
import { type Locale, localizedPath } from "@/i18n/routing";

/** The localized 404. Its title and noindex come from the locale layout's head. */
export function NotFoundPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Chrome.notFound");
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
