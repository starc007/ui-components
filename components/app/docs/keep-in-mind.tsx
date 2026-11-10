import { useTranslations } from "next-intl";

export function KeepInMind() {
  const t = useTranslations("Docs.keepInMind");
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {t.rich("body", {
          link: (chunks) => (
            <a
              href="https://x.com/saurra3h"
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground underline-offset-2 hover:underline"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </section>
  );
}
