import { ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";

const CAL_URL = "https://cal.com/saurra3h/30min";

export function WorkCta() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[28px] bg-card px-8 py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-30px_44px_-32px_rgba(0,0,0,0.12)] md:px-16 md:py-24">
          <div className="relative flex flex-col items-center gap-8 text-center">
            <div className="max-w-xl">
              <h2 className="font-pixel text-3xl font-semibold text-foreground md:text-5xl md:leading-[1.15]">
                Want components built for your product?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Custom motion components and frontend systems, built to spec.
                Book a call and let's talk it through.
              </p>
            </div>

            <PressLink
              href={CAL_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
