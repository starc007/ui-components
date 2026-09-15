import { ArrowUpRight } from "lucide-react";
import { RainbowCta } from "@/components/app/rainbow-cta";

export function ProCard() {
  return (
    <section
      aria-labelledby="beui-pro-card-title"
      className="rounded-3xl border border-border bg-background p-2"
    >
      <div className="flex h-32 items-center justify-center rounded-2xl bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-4xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-md border border-accent/40 bg-background/60 px-2 py-0.5 text-base font-medium text-foreground">
            Pro
          </span>
        </div>
      </div>
      <div className="px-2 pt-5 pb-4">
        <h2
          id="beui-pro-card-title"
          className="text-xl font-semibold leading-tight tracking-tight text-foreground"
        >
          Ship your next idea faster.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Premium motion components and blocks for React and Next.js.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">$179 lifetime access</span>
          <span className="block">Limited offer</span>
        </p>
      </div>
      <RainbowCta
        href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=component_sidebar"
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="w-full"
        innerClassName="py-2.5"
      >
        Explore beUI Pro
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}
