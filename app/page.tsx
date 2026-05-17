import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/app/icons";
import { registry, allComponents } from "@/lib/registry";
import { Magnetic } from "@/components/motion/magnetic";
import { NumberTicker } from "@/components/motion/number-ticker";
import { HeroPreviewDock } from "@/components/app/hero-preview-dock";

export default function Home() {
  const totalComponents = allComponents().length;

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 md:pt-28">
        <BackgroundFx />

        <div className="mx-auto max-w-5xl text-center">
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group mb-7 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg) press"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-fg)" />
            v2 is live — built on Tailwind 4, React 19
            <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-(--color-fg) md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]">
            Bespoke motion <br className="hidden md:block" />
            components for React.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg">
            A curated library of motion-driven components.{" "}
            <span className="text-(--color-fg)">No Radix, no shadcn — just craft.</span>{" "}
            Copy, paste, ship.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.2}>
              <Link
                href="/components/motion"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-fg) px-6 text-sm font-medium text-(--color-bg) press"
              >
                Browse components
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Link
              href="https://github.com/starc007/ui-components"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-6 text-sm font-medium text-(--color-fg) press hover:border-(--color-border-strong)"
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl px-2 md:mt-20">
          <HeroPreviewDock />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-border) md:grid-cols-4">
          <Stat label="Components" value={totalComponents} suffix="+" />
          <Stat label="Shared JS" value={102} suffix=" kB" />
          <Stat label="Dependencies" value={6} />
          <Stat label="License" displayValue="MIT" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)">
              Catalogue
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">
              {totalComponents} motion components.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="hidden text-sm text-(--color-fg-muted) hover:text-(--color-fg) md:inline-flex"
          >
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registry[0].components.map((comp) => (
            <Link
              key={comp.slug}
              href={`/components/motion/${comp.slug}`}
              className="group flex flex-col rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5 transition-colors hover:border-(--color-border-strong)"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-medium text-(--color-fg)">{comp.name}</h3>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-1.5 text-sm text-(--color-fg-muted)">{comp.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  displayValue,
  suffix,
}: {
  label: string;
  value?: number;
  displayValue?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-(--color-bg) p-6">
      <span className="text-xs uppercase tracking-wider text-(--color-fg-muted)">{label}</span>
      <span className="text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">
        {displayValue ?? <NumberTicker value={value ?? 0} suffix={suffix} locale />}
      </span>
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
