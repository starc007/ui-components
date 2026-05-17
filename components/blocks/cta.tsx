import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CtaProps {
  title: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

export function Cta({ title, description, primary, secondary, className }: CtaProps) {
  return (
    <section className={cn("px-4 py-20", className)}>
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-bg-elev) p-10 md:p-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, color-mix(in oklch, var(--color-accent) 40%, transparent), transparent 50%), radial-gradient(circle at 80% 100%, color-mix(in oklch, var(--color-violet) 40%, transparent), transparent 50%)",
          }}
        />
        <div className="absolute inset-0 -z-10 grid-noise mask-radial-fade opacity-30" />

        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-(--color-fg) md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-base text-(--color-fg-muted)">{description}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={primary.href}
            className="group inline-flex h-11 items-center gap-2 rounded-lg bg-(--color-fg) px-5 text-sm font-medium text-(--color-bg) transition-transform hover:scale-[1.02]"
          >
            {primary.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex h-11 items-center rounded-lg border border-(--color-border) bg-(--color-bg) px-5 text-sm font-medium text-(--color-fg) hover:border-(--color-border-strong)"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
