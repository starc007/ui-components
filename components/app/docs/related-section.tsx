import { useTranslations } from "use-intl";
import { ComponentCard } from "@/components/app/docs/component-card";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";

export type RelatedItem = {
  category: string;
  slug: string;
  name: string;
  description: string;
  badge?: "new";
  launchedAt?: string;
  /** Overrides the web component page, as for React Native pages. */
  href?: string;
};

/** A component page's related components, as cards. */
export function RelatedSection({
  related,
  heading,
  id = "related-components",
}: {
  related: RelatedItem[];
  /** Replaces "Related components", as for a variant page's siblings. */
  heading?: string;
  id?: string;
}) {
  const t = useTranslations("Docs.component");
  if (related.length === 0) return null;
  return (
    <section id={id} className="mt-12 scroll-mt-24 border-t border-border pt-8">
      <AnchorHeading section={id} headingClassName="text-sm font-medium text-foreground">
        {heading ?? t("relatedComponents")}
      </AnchorHeading>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((rel) => (
          <ComponentCard
            key={`${rel.category}/${rel.slug}`}
            categorySlug={rel.category}
            slug={rel.slug}
            name={rel.name}
            description={rel.description}
            badge={rel.badge}
            launchedAt={rel.launchedAt}
            href={rel.href}
          />
        ))}
      </div>
    </section>
  );
}
