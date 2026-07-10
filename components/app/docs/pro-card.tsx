import { ArrowUpRight } from "lucide-react";
import { RainbowCta } from "@/components/app/rainbow-cta";

export function ProCard() {
  return (
    <section
      aria-labelledby="beui-pro-card-title"
      className="mt-8 rounded-2xl p-4 border border-border"
    >
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-success">
        Limited Offer - Extra 30% off
      </p>
      <h2
        id="beui-pro-card-title"
        className="mt-2 text-xl font-semibold leading-tight tracking-tight text-foreground"
      >
        Ship faster with{" "}
        <span className="bg-brand-accent bg-clip-text text-transparent">
          beUI Pro
        </span>
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Premium motion components and blocks for React and Next.js.
      </p>
      <RainbowCta
        href="https://pro.beui.dev"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5"
      >
        Get lifetime access
        <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </RainbowCta>
    </section>
  );
}
