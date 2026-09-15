import { ArrowUpRight } from "lucide-react";
import { RainbowCta } from "@/components/app/rainbow-cta";

export function ProCard() {
  return (
    <section
      aria-labelledby="beui-pro-card-title"
      className="rounded-3xl border border-border bg-background p-2"
    >
      <div className="flex h-24 items-center justify-center rounded-2xl bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-md border border-accent/40 bg-background/60 px-2 py-0.5 text-base font-medium text-foreground">
            Pro
          </span>
        </div>
      </div>
      <div className="px-2 pt-3 pb-3">
        <h2
          id="beui-pro-card-title"
          className="text-lg font-semibold leading-tight tracking-tight text-foreground"
        >
          Ship your next idea faster.
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          200+ blocks and premium motion components for React and Next.js.
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">$179 lifetime access</span>
          <span>· Limited offer</span>
        </p>
      </div>
      <RainbowCta
        href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=component_sidebar"
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="w-full"
        innerClassName="py-2"
      >
        Explore beUI Pro
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}
