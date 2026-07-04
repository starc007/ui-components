import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { registry } from "@/lib/registry";
import { Hero } from "@/components/app/landing/hero";
import { InstallCommand } from "@/components/app/docs/install-command";
import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { Testimonials } from "@/components/app/landing/testimonials";
import { WorkCta } from "@/components/app/landing/work-cta";

const CURATED: { category: string; slug: string }[] = [
  { category: "motion", slug: "button" },
  { category: "motion", slug: "morphing-modal" },
  { category: "motion", slug: "animated-toast-stack" },
  { category: "motion", slug: "action-swap" },
  { category: "motion", slug: "dock" },
  { category: "motion", slug: "tabs" },
  { category: "blocks", slug: "dynamic-island" },
  { category: "blocks", slug: "command-palette" },
  { category: "blocks", slug: "expandable-action-bar" },
  { category: "blocks", slug: "expandable-tabs" },
  { category: "motion", slug: "tilt-card" },
  { category: "motion", slug: "bottom-sheet" },
  { category: "motion", slug: "switch" },
  { category: "motion", slug: "tooltip" },
  { category: "motion", slug: "text-animation" },
  { category: "motion", slug: "number" },
  { category: "motion", slug: "bouncy-accordion" },
  { category: "motion", slug: "range-slider" },
  { category: "motion", slug: "theme-toggle" },
  { category: "motion", slug: "drawer" },
  { category: "blocks", slug: "swap" },
  { category: "blocks", slug: "otp-input" },
  { category: "blocks", slug: "swipeable-list" },
  { category: "blocks", slug: "bloom-menu" },
];

export default function Home() {
  const curatedComponents = CURATED.flatMap(({ category, slug }) => {
    const cat = registry.find((c) => c.slug === category);
    const comp = cat?.components.find((c) => c.slug === slug);
    return comp ? [{ category, component: comp }] : [];
  });

  const newComponents = registry.flatMap((category) =>
    category.components
      .filter((component) => component.badge === "new")
      .map((component) => ({ category: category.slug, component })),
  );

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 md:pt-28">
        <Hero />
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-24">
        <p className="mb-5 text-center text-sm text-muted-foreground">
          Built on Framer Motion. Distributed via shadcn.
        </p>
        <InstallCommand />
      </section>

      {newComponents.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-8 flex flex-col gap-4 border-t border-border pt-12 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-pixel text-xs font-medium uppercase text-muted-foreground">
                New
              </p>
              <h2 className="mt-2 font-pixel text-3xl font-medium leading-tight text-foreground md:text-4xl">
                Recently launched.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {newComponents.map(({ category, component }) => (
              <LandingComponentCard
                key={`${category}-${component.slug}`}
                component={component}
                category={category}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex flex-col gap-4 border-t border-border pt-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-xs font-medium uppercase text-muted-foreground">
              Components
            </p>
            <h2 className="mt-2 font-pixel text-3xl font-medium leading-tight text-foreground md:text-4xl">
              Motion primitives.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="inline-flex items-center self-start text-sm font-medium text-muted-foreground hover:text-foreground md:self-center"
          >
            Browse all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {curatedComponents.map(({ category, component }) => (
            <LandingComponentCard
              key={`${category}-${component.slug}`}
              component={component}
              category={category}
            />
          ))}
        </div>
      </section>

      <Testimonials />

      <WorkCta />

      <SiteFooter />
    </div>
  );
}
