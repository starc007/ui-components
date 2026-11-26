import { useTranslations } from "use-intl";
import { PreviewCard } from "@/components/app/docs/preview-card";
import { getPreview } from "@/components/previews";
import type { HighlightedCode } from "@/lib/highlight";

export function DefaultTabs({
  category,
  slug,
  source,
  usage,
}: {
  category: string;
  slug: string;
  source: HighlightedCode;
  usage: HighlightedCode;
}) {
  const t = useTranslations("Docs.component");
  const Preview = getPreview(category, slug);
  return (
    <section id="preview" className="mt-12 scroll-mt-24">
      <h2 className="sr-only">{t("preview")}</h2>
      <PreviewCard
        stageId="preview-stage"
        minHeight="min-h-[360px]"
        preview={Preview ? <Preview /> : null}
        usage={usage}
        source={source}
      />
    </section>
  );
}
