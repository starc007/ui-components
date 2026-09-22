import { ArrowUpRight, Mail } from "lucide-react";
import { PressLink } from "@/components/app/press-link";
import styles from "./landing.module.css";

const CAL_URL = "https://cal.com/saurra3h/30min";
const EMAIL = "saurabh10102@gmail.com";

export function WorkCta() {
  return (
    <section
      aria-labelledby="landing-contact"
      className="mx-auto max-w-7xl px-4 py-16 sm:py-24"
    >
      <div className="relative isolate overflow-hidden rounded-3xl border border-border px-6 py-16 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 0% 100%, #0285f730, transparent 60%), radial-gradient(ellipse at 100% 0%, #38bdf830, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-xl">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-border bg-background text-foreground">
            <Mail aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </span>
          <p className="mt-6 text-sm text-muted-foreground">
            A direct line to the maker
          </p>
          <h2
            id="landing-contact"
            className="mt-4 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
          >
            Something a little more you?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-sm leading-7 text-muted-foreground">
            Need a custom component or a hand bringing your product to life?
            Tell me what you’re building.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <PressLink
              href={CAL_URL}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.primaryLink}
            >
              Book a call
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </PressLink>
            <PressLink
              href={`mailto:${EMAIL}`}
              className={styles.secondaryLink}
            >
              Email me
              <Mail aria-hidden="true" className="size-4" />
            </PressLink>
          </div>
          <p className="mt-7 text-xs text-muted-foreground">
            Saurabh, maker of beUI
          </p>
        </div>
      </div>
    </section>
  );
}
