import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Palette, ShieldCheck, Code2, Layers } from "lucide-react";
import { registry } from "@/lib/registry";

export default function Home() {
  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden px-4 pb-24 pt-24 md:pt-32">
        <div className="absolute inset-0 -z-10 grid-noise mask-radial-fade opacity-60" />
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -z-10 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--color-accent) 70%, transparent), transparent 60%)",
          }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg-muted)">
            <Sparkles className="h-3 w-3 text-(--color-accent)" />
            v2 — rebuilt on Tailwind 4 + React 19
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-(--color-fg) md:text-6xl lg:text-7xl">
            Interfaces that{" "}
            <span className="bg-gradient-to-br from-(--color-accent) via-(--color-violet) to-(--color-neon) bg-clip-text text-transparent">
              feel alive.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg">
            A handcrafted set of React + Tailwind components. Copy, paste, ship.
            Theme it once with OKLCH tokens — light and dark, equally first-class.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/components/primitives"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-(--color-fg) px-5 text-sm font-medium text-(--color-bg) transition-transform hover:scale-[1.02]"
            >
              Browse components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="https://github.com/starc007/ui-components"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-11 items-center rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-5 text-sm font-medium text-(--color-fg) hover:border-(--color-border-strong)"
            >
              Star on GitHub
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Zap, label: "Tailwind v4" },
            { icon: Code2, label: "React 19 + Next 15" },
            { icon: Palette, label: "OKLCH tokens" },
            { icon: ShieldCheck, label: "MIT licensed" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-4 text-sm text-(--color-fg)"
            >
              <Icon className="h-4 w-4 text-(--color-accent)" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-(--color-fg) md:text-3xl">
              Browse by category
            </h2>
            <p className="mt-1 text-(--color-fg-muted)">{registry.flatMap((c) => c.components).length} components, four categories.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {registry.map((cat) => (
            <Link
              key={cat.slug}
              href={`/components/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 transition-colors hover:border-(--color-border-strong)"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-accent)">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-(--color-fg)">{cat.name}</h3>
              <p className="mt-1 text-sm text-(--color-fg-muted)">{cat.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.components.slice(0, 6).map((c) => (
                  <span
                    key={c.slug}
                    className="rounded-full border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-xs text-(--color-fg-muted)"
                  >
                    {c.name}
                  </span>
                ))}
                {cat.components.length > 6 ? (
                  <span className="rounded-full border border-(--color-border) bg-(--color-bg) px-2 py-0.5 text-xs text-(--color-fg-muted)">
                    +{cat.components.length - 6}
                  </span>
                ) : null}
              </div>
              <ArrowRight className="absolute right-6 top-6 h-4 w-4 text-(--color-fg-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-fg)" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
