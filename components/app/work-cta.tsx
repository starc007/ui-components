import { ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";

const CAL_URL = "https://cal.com/saurra3h/30min";

export function WorkCta() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-card px-8 py-16 md:px-16 md:py-20">
          {/* concentric-ring depth, theme-derived */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-28 hidden md:block"
          >
            <div className="size-[460px] rounded-full border border-foreground/[0.06]">
              <div className="absolute inset-14 rounded-full border border-foreground/[0.05]">
                <div className="absolute inset-14 rounded-full border border-foreground/[0.04]" />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-pixel text-2xl font-medium text-foreground md:text-[2rem] md:leading-[1.15]">
                Want components built for your product?
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Custom motion components and frontend systems, built to spec. Book a
                call and let's talk it through.
              </p>
            </div>

            <PressLink
              href={CAL_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book a call
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </PressLink>
          </div>
        </div>
      </div>
    </section>
  );
}
