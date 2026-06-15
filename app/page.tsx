import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { registry } from "@/lib/registry";
import { Hero } from "@/components/app/hero";
import { LandingComponentCard } from "@/components/app/landing-component-card";

export default function Home() {
  const motionCategory = registry[0];
  const blocksCategory = registry[1];

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 md:pt-28">
        <Hero />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex flex-col gap-4 border-t border-(--color-border) pt-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-xs font-medium uppercase text-(--color-fg-muted)">
              Components
            </p>
            <h2 className="mt-2 max-w-2xl font-pixel text-3xl font-medium leading-tight text-(--color-fg) md:text-4xl">
              {motionCategory.components.length} components.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="inline-flex items-center self-start text-sm font-medium text-(--color-fg-muted) hover:text-(--color-fg) md:self-center"
          >
            Browse all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {motionCategory.components.map((comp) => (
            <LandingComponentCard key={comp.slug} component={comp} category="motion" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-28">
        <div className="mb-8 flex flex-col gap-4 border-t border-(--color-border) pt-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-xs font-medium uppercase text-(--color-fg-muted)">
              Blocks
            </p>
            <h2 className="mt-2 max-w-2xl font-pixel text-3xl font-medium leading-tight text-(--color-fg) md:text-4xl">
              {blocksCategory.components.length} blocks.
            </h2>
          </div>
          <Link
            href="/components/blocks"
            className="inline-flex items-center self-start text-sm font-medium text-(--color-fg-muted) hover:text-(--color-fg) md:self-center"
          >
            Browse all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {blocksCategory.components.map((comp) => (
            <LandingComponentCard key={comp.slug} component={comp} category="blocks" />
          ))}
        </div>
      </section>
    </div>
  );
}
