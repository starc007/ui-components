import { useTranslations } from "use-intl";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";
import { InstallBlock } from "@/components/app/docs/install-block";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewCard } from "@/components/app/docs/preview-card";
import { PropsTable } from "@/components/app/docs/props-table";
import { previews } from "@/components/previews";
import { CreditLink } from "./credit-link";
import type { ExampleData } from "./types";

export function ExampleBlock({ data, showCredit }: { data: ExampleData; showCredit: boolean }) {
  const t = useTranslations("Docs.component");
  const { example, source, usage, propsDocs, manual } = data;
  const Preview = previews[example.previewKey];

  return (
    <section id={example.slug} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <AnchorHeading
          section={example.slug}
          headingClassName="text-xl font-medium tracking-tight text-foreground"
          trailing={
            example.badge === "new" ? (
              <NewBadge launchedAt={example.launchedAt} className="ml-0.5" />
            ) : null
          }
        >
          {example.name}
        </AnchorHeading>
        <code className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
          {example.file.split("/").pop()}
        </code>
      </div>
      {example.credit && showCredit ? (
        <CreditLink credit={example.credit} className="-mt-2 mb-4" />
      ) : null}
      <div id={`${example.slug}-preview`} className="scroll-mt-24">
        <PreviewCard
          stageId={`${example.slug}-stage`}
          minHeight="min-h-[320px]"
          preview={Preview ? <Preview /> : null}
          usage={usage}
          source={source}
        />
      </div>
      {example.installSlug ? (
        <div
          id={`${example.slug}-install`}
          className="mt-8 min-w-0 scroll-mt-24 border-t border-border pt-8"
        >
          <AnchorHeading
            section={`${example.slug}-install`}
            headingClassName="text-sm font-medium text-foreground"
          >
            {t("install")}
          </AnchorHeading>
          <div className="mt-3">
            <InstallBlock slug={example.installSlug} manual={manual} />
          </div>
        </div>
      ) : null}
      {propsDocs.length ? (
        <div
          id={`${example.slug}-api-reference`}
          className="mt-8 min-w-0 scroll-mt-24 border-t border-border pt-8"
        >
          <AnchorHeading
            section={`${example.slug}-api-reference`}
            headingClassName="text-sm font-medium text-foreground"
          >
            {t("apiReference")}
          </AnchorHeading>
          <div className="mt-3">
            <PropsTable docs={propsDocs} idPrefix={`${example.slug}-api-reference`} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
