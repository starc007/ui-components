import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { GithubIcon } from "@/components/app/icons";
import { registry, allComponents } from "@/lib/registry";
import { SpotlightCard } from "@/components/motion/spotlight-card";
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
            className="group mb-7 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-(--color-fg) glass-thin press"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-neon) opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-neon)" />
            </span>
            v2 is live — built on Tailwind 4, React 19
            <ArrowRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-(--color-fg) md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]">
            Interfaces that{" "}
            <span className="relative inline-block">
              <span className="relative bg-gradient-to-br from-(--color-accent) via-(--color-violet) to-(--color-neon) bg-clip-text text-transparent">
                feel alive
              </span>
              <Sparkles
                aria-hidden
                className="absolute -right-7 -top-2 h-5 w-5 text-(--color-accent) md:-right-9 md:-top-3 md:h-7 md:w-7"
              />
            </span>
            .
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg">
            A handcrafted set of premium React + Tailwind components.{" "}
            <span className="text-(--color-fg)">Copy, paste, ship.</span> Theme once with OKLCH
            tokens — dark and light, equally first-class.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.25}>
              <Link
                href="/components/motion"
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl px-6 text-sm font-semibold text-(--color-accent-fg) press
                bg-(--color-accent)
                shadow-[0_1px_0_0_rgb(255_255_255/0.25)_inset,0_0_0_1px_color-mix(in_oklch,var(--color-accent)_40%,transparent),0_24px_60px_-18px_var(--color-accent)]"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.5)_50%,transparent_70%)] transition-transform duration-1000 group-hover:translate-x-full"
                />
                <span className="relative">Browse components</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Link
              href="https://github.com/starc007/ui-components"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium text-(--color-fg) glass-thin press hover:border-(--color-border-strong)"
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
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-border) md:grid-cols-4">
          <Stat label="Components" value={totalComponents} suffix="+" />
          <Stat label="Bundle (shared JS)" value={102} suffix=" kB" />
          <Stat label="Categories" value={registry.length} />
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
              Built across three rooms.
            </h2>
          </div>
          <Link
            href="/components/motion"
            className="hidden text-sm text-(--color-fg-muted) hover:text-(--color-fg) md:inline-flex"
          >
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {registry.map((cat) => (
            <Link
              key={cat.slug}
              href={`/components/${cat.slug}`}
              className="block press"
            >
              <SpotlightCard className="h-full p-6">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-accent)">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <h3 className="text-lg font-semibold text-(--color-fg)">{cat.name}</h3>
                  <span className="text-xs tabular-nums text-(--color-fg-muted)">
                    {cat.components.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-(--color-fg-muted)">{cat.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {cat.components.slice(0, 5).map((c) => (
                    <span
                      key={c.slug}
                      className="rounded-full border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-[11px] text-(--color-fg-muted)"
                    >
                      {c.name}
                    </span>
                  ))}
                  {cat.components.length > 5 ? (
                    <span className="rounded-full border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-[11px] text-(--color-fg-muted)">
                      +{cat.components.length - 5}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-(--color-fg)">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </SpotlightCard>
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
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-[640px] w-[1100px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklch, var(--color-accent) 50%, transparent), color-mix(in oklch, var(--color-violet) 30%, transparent) 45%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-0 top-0 -z-10 h-full w-full"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--color-neon) 12%, transparent), transparent 40%)",
        }}
      />
    </>
  );
}
