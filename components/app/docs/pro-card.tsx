import { ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";

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
      <PressLink
        href="https://pro.beui.dev"
        target="_blank"
        rel="noreferrer noopener"
        className="group mt-5 inline-flex min-h-10 animate-rainbow-border items-stretch overflow-hidden rounded-lg bg-primary bg-[linear-gradient(90deg,var(--success),var(--warning),var(--accent),var(--violet),var(--success),var(--warning),var(--accent),var(--violet),var(--success))] bg-[length:200%_100%] p-0.5 text-sm font-medium text-primary-foreground motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 transition-colors group-hover:bg-primary/90">
          Get lifetime access
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </PressLink>
    </section>
  );
}
