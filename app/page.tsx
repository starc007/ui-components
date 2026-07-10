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

const GRID_CLASS =
  "grid grid-cols-1 gap-4 [grid-auto-rows:19rem] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:self-auto"
        >
          Browse all
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export default function Home() {
  const newComponents = registry
    .flatMap((category) =>
      category.components
        .filter((component) => component.badge === "new")
        .map((component) => ({ category: category.slug, component })),
    )
    // Newest first: most recently launched components lead the section.
    .sort((a, b) =>
      (b.component.launchedAt ?? "").localeCompare(a.component.launchedAt ?? ""),
    );
  const newComponentKeys = new Set(
    newComponents.map(
      ({ category, component }) => `${category}/${component.slug}`,
    ),
  );
  const curatedComponents = CURATED.flatMap(({ category, slug }) => {
    const cat = registry.find((c) => c.slug === category);
    const comp = cat?.components.find((c) => c.slug === slug);
    return comp ? [{ category, component: comp }] : [];
  }).filter(
    ({ category, component }) =>
      !newComponentKeys.has(`${category}/${component.slug}`),
  );

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-20 pt-20 md:pt-28">
        <Hero />
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-24">
        <p className="mb-5 text-center text-sm text-muted-foreground">
          Built on Framer Motion. Distributed via shadcn.
        </p>
        <InstallCommand />
      </section>

      {newComponents.length ? (
        <section className="mx-auto max-w-7xl border-t border-border px-4 pb-16 pt-14">
          <SectionHeader eyebrow="New" title="Recently launched" />
          <div className={GRID_CLASS}>
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

      <section className="mx-auto max-w-7xl border-t border-border px-4 pb-16 pt-14">
        <SectionHeader
          eyebrow="Components"
          title="Motion primitives"
          href="/components/motion"
        />
        <div className={GRID_CLASS}>
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
