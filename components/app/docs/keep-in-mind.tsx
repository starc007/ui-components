import { useTranslations } from "use-intl";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";

export function KeepInMind() {
  const t = useTranslations("Docs.keepInMind");
  return (
    <section id="keep-in-mind" className="mt-12 scroll-mt-24 border-t border-border pt-8">
      <AnchorHeading section="keep-in-mind" headingClassName="text-sm font-medium text-foreground">
        {t("title")}
      </AnchorHeading>
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
