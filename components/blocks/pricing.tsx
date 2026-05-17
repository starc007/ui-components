import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
};

export interface PricingProps {
  title?: string;
  description?: string;
  tiers: PricingTier[];
  className?: string;
}

export function Pricing({ title, description, tiers, className }: PricingProps) {
  return (
    <section className={cn("px-4 py-20", className)}>
      <div className="mx-auto max-w-6xl">
        {title || description ? (
          <div className="mb-12 text-center">
            {title ? (
              <h2 className="text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">{title}</h2>
            ) : null}
            {description ? <p className="mt-3 text-(--color-fg-muted)">{description}</p> : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-(--color-bg-elev) p-6 transition-colors",
                tier.highlighted
                  ? "border-(--color-accent) shadow-[0_0_0_1px_var(--color-accent),0_24px_60px_-20px_var(--color-accent)]"
                  : "border-(--color-border) hover:border-(--color-border-strong)",
              )}
            >
              {tier.highlighted ? (
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-(--color-accent) px-2.5 py-0.5 text-xs font-medium text-(--color-accent-fg)">
                  Popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-(--color-fg)">{tier.name}</h3>
              {tier.description ? <p className="mt-1 text-sm text-(--color-fg-muted)">{tier.description}</p> : null}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-(--color-fg)">{tier.price}</span>
                {tier.period ? <span className="text-sm text-(--color-fg-muted)">/{tier.period}</span> : null}
              </div>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-(--color-fg)">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--color-accent)" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={tier.cta.href}
                className={cn(
                  "mt-8 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
                  tier.highlighted
                    ? "bg-(--color-accent) text-(--color-accent-fg) hover:brightness-110"
                    : "bg-(--color-bg) text-(--color-fg) border border-(--color-border) hover:border-(--color-border-strong)",
                )}
              >
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
