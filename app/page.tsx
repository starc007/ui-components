import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { registry } from "@/lib/registry";
import { getPreview } from "@/components/previews";
import { Hero } from "@/components/app/hero";

export default function Home() {
  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 md:pt-28">
        <BackgroundFx />
        <Hero />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-28 pt-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)">
              Catalogue
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">
              {registry[0].components.length} motion components.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="hidden text-sm text-(--color-fg-muted) hover:text-(--color-fg) md:inline-flex items-center"
          >
            Browse all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registry[0].components.map((comp) => {
            const Preview = getPreview("motion", comp.slug);
            return (
              <Link
                key={comp.slug}
                href={`/components/motion/${comp.slug}`}
                className="group relative flex flex-col overflow-hidden border border-(--color-border) bg-(--color-bg-elev) transition-colors hover:border-(--color-border-strong)"
              >
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-(--color-bg) px-5 py-6 mask-b-fade">
                  <div className="pointer-events-none scale-75 origin-center [&_*]:!cursor-default">
                    {Preview ? <Preview /> : null}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-(--color-border) p-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-(--color-fg)">
                      {comp.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-(--color-fg-muted)">
                      {comp.description}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BackgroundFx() {
  return (
    <>
      <div className="absolute inset-0 -z-10 grid-noise mask-radial-fade opacity-40" />
    </>
  );
}
