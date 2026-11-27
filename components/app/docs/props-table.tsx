import { useTranslations } from "use-intl";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";
import type { ComponentPropsDoc } from "@/lib/props-extractor";

const COLUMNS = "sm:grid-cols-[140px_minmax(160px,0.75fr)_minmax(240px,2fr)]";

/** `ChatBubbleProps` → `chat-bubble-props`. */
function kebab(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/** One id per table, unique within the page section. */
function tableIds(docs: ComponentPropsDoc[], prefix: string) {
  const seen = new Map<string, number>();
  return docs.map((doc) => {
    const base = `${prefix}-${kebab(doc.displayName)}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  });
}

export function PropsTable({
  docs,
  idPrefix,
}: {
  docs: ComponentPropsDoc[];
  /** The section id. Gives each table heading a linkable id under it. */
  idPrefix?: string;
}) {
  const t = useTranslations("Docs.propsTable");
  const withProps = docs.filter((doc) => doc.props.length > 0);
  if (!withProps.length) return null;
  const ids = idPrefix ? tableIds(withProps, idPrefix) : [];

  return (
    <div className="flex flex-col gap-8">
      {withProps.map((doc, index) => (
        <div key={doc.displayName}>
          {withProps.length > 1 ? (
            ids[index] ? (
              <AnchorHeading
                as="h3"
                id={ids[index]}
                className="mb-3"
                headingClassName="font-mono text-sm font-medium text-foreground"
              >
                {doc.displayName}
              </AnchorHeading>
            ) : (
              <h3 className="mb-3 font-mono text-sm font-medium text-foreground">
                {doc.displayName}
              </h3>
            )
          ) : null}
          <div className="rounded-2xl bg-card p-2 sm:pt-0">
            <div
              aria-hidden="true"
              className={`hidden gap-4 px-6 py-3 text-xs font-medium text-muted-foreground sm:grid ${COLUMNS}`}
            >
              <span>{t("prop")}</span>
              <span>{t("type")}</span>
              <span className="justify-self-end">{t("default")}</span>
            </div>
            <div className="divide-y divide-border rounded-lg bg-background">
            {doc.props.map((prop) => (
              <div
                key={prop.name}
                className={`grid grid-cols-1 gap-2 px-4 py-3 sm:gap-4 ${COLUMNS}`}
              >
                <code className="h-fit w-fit rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                  {prop.name}
                  {prop.required ? "" : "?"}
                </code>
                <div className="min-w-0">
                  <code className="w-fit wrap-anywhere rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                    {prop.type}
                  </code>
                  {prop.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {prop.description}
                    </p>
                  ) : null}
                </div>
                {/* Give verbose defaults the widest track and let them wrap
                    without pushing into the type column. */}
                {prop.defaultValue ? (
                  <div className="flex min-w-0 items-baseline gap-2 sm:justify-self-end">
                    <span className="text-xs text-muted-foreground sm:sr-only">{t("default")}</span>
                    <code className="h-fit w-fit min-w-0 wrap-anywhere rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
                      {prop.defaultValue}
                    </code>
                  </div>
                ) : null}
              </div>
            ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
