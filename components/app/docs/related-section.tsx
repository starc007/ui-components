import { ComponentCard } from "@/components/app/docs/component-card";

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
export function RelatedSection({ related }: { related: RelatedItem[] }) {
  if (related.length === 0) return null;
  return (
    <section
      id="related-components"
      className="mt-12 scroll-mt-24 border-t border-border pt-8"
    >
      <h2 className="text-sm font-semibold text-foreground">Related components</h2>
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
