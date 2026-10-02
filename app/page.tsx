import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { FreeAndPro } from "@/components/app/landing/free-and-pro";
import { LandingFaq } from "@/components/app/landing/faq";
import { GettingStarted } from "@/components/app/landing/getting-started";
import { Hero } from "@/components/app/landing/hero";
import { LandingComponentCard } from "@/components/app/landing/landing-component-card";
import { Testimonials } from "@/components/app/landing/testimonials";
import { WorkCta } from "@/components/app/landing/work-cta";
import { isComponentNew } from "@/lib/component-status";
import { registry } from "@/lib/registry";

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
const RECENTLY_LAUNCHED_FEATURED = "blocks/card-folder";

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
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:self-auto"
        >
          Browse animated React components
          <ArrowRight aria-hidden="true" className="ml-1.5 size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export default function Home() {
  const newComponents = registry
    .flatMap((category) =>
      category.components
        .filter((component) => isComponentNew(component))
        .map((component) => {
          const newVariant = component.examples
            ?.filter((example) => isComponentNew(example))
            .sort((a, b) =>
              (b.launchedAt ?? "").localeCompare(a.launchedAt ?? ""),
            )[0];

          return {
            category: category.slug,
            previewKey: newVariant?.previewKey,
            component: newVariant
              ? {
                  ...component,
                  name: newVariant.name,
                  description: newVariant.description ?? component.description,
                  launchedAt: newVariant.launchedAt,
                }
              : component,
          };
        }),
    )
    // Keep the featured launch first, then preserve newest-first ordering.
    .sort((a, b) => {
      const aFeatured =
        `${a.category}/${a.component.slug}` === RECENTLY_LAUNCHED_FEATURED;
      const bFeatured =
        `${b.category}/${b.component.slug}` === RECENTLY_LAUNCHED_FEATURED;

      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;

      return (b.component.launchedAt ?? "").localeCompare(
        a.component.launchedAt ?? "",
      );
    });
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
      <section className="px-4 pb-12 pt-20 sm:pb-14 sm:pt-28">
        <Hero />
      </section>

      <section
        aria-labelledby="landing-sponsors"
        className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pb-12 sm:pb-16"
      >
        <h2
          id="landing-sponsors"
          className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground"
        >
          Sponsored by
        </h2>
        <Link
          href="https://tracwell.app/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=landing_hero"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Image
            src="/sponsors/tracwell-icon-light.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 dark:hidden"
          />
          <Image
            src="/sponsors/tracwell-icon-dark.svg"
            alt=""
            width={28}
            height={28}
            className="hidden size-7 dark:block"
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            Tracwell
          </span>
        </Link>
      </section>

      <GettingStarted />

      {newComponents.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
          <SectionHeader eyebrow="New" title="Recently launched" />
          <div className={GRID_CLASS}>
            {newComponents.map(({ category, component, previewKey }) => (
              <LandingComponentCard
                key={`${category}-${component.slug}`}
                component={component}
                category={category}
                previewKey={previewKey}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-4">
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

      <FreeAndPro />

      <LandingFaq />

      <WorkCta />

      <SiteFooter />
    </div>
  );
}
