import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { registry } from "@/lib/registry";
import { getPreview } from "@/components/previews";
import { Hero } from "@/components/app/hero";

export default function Home() {
  const motionCategory = registry[0];
  const componentCount = motionCategory.components.length;

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 md:pt-28">
        <Hero />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-28">
        <div className="mb-8 flex flex-col gap-4 border-t border-(--color-border) pt-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-xs font-medium uppercase text-(--color-fg-muted)">
              Components
            </p>
            <h2 className="mt-2 max-w-2xl font-pixel text-3xl font-medium leading-tight text-(--color-fg) md:text-4xl">
              {componentCount} components.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="inline-flex items-center self-start text-sm font-medium text-(--color-fg-muted) hover:text-(--color-fg) md:self-center"
          >
            Browse all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {motionCategory.components.map((comp) => {
            const Preview = getPreview("motion", comp.slug);
            return (
              <article
                key={comp.slug}
                className="group relative flex min-h-[318px] flex-col overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-elev) transition-[border-color,transform] duration-200 [contain:paint] hover:-translate-y-0.5 hover:border-(--color-border-strong)"
              >
                <Link
                  href={`/components/motion/${comp.slug}`}
                  aria-label={`View ${comp.name}`}
                  className="absolute inset-0 z-10"
                />
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-(--color-bg) px-5 py-6 [contain:paint] mask-b-fade">
                  <div className="pointer-events-none flex w-full max-w-full origin-center scale-75 items-center justify-center overflow-hidden [contain:paint] [&_*]:!cursor-default">
                    {Preview ? <Preview /> : null}
                  </div>
                </div>
                <div className="flex flex-1 items-start justify-between gap-3 border-t border-(--color-border) p-4">
                  <div className="min-w-0">
                    <h3 className="font-pixel text-base font-medium text-(--color-fg)">
                      {comp.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-(--color-fg-muted)">
                      {comp.description}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
