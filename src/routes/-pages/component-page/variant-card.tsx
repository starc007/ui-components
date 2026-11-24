import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import type { ComponentEntry } from "@/lib/registry";
import type { VariantCardData } from "./types";

/** One variant on a split page's overview: a live preview linking to its page. */
export function VariantCard({
  variant,
  component,
  category,
}: {
  variant: VariantCardData;
  component: ComponentEntry;
  category: string;
}) {
  return (
    <div className="h-72">
      <LandingComponentCard
        component={component}
        category={category}
        previewKey={variant.previewKey}
        id={variant.slug}
        href={variant.href}
        name={variant.name}
        badge={variant.badge}
        launchedAt={variant.launchedAt}
      />
    </div>
  );
}
