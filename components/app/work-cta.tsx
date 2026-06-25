import { ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";

const CAL_URL = "https://cal.com/saurra3h/30min";

export function WorkCta() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-card px-8 py-12 md:flex-row md:items-center md:justify-between md:px-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Want components built for your product?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Custom motion components and frontend systems, built to spec. Book a
              call to talk it through.
            </p>
          </div>
          <PressLink
            href={CAL_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Book a call
            <ArrowUpRight className="h-4 w-4" />
          </PressLink>
        </div>
      </div>
    </section>
  );
}
