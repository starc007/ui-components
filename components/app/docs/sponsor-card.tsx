import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SponsorCard() {
  return (
    <section aria-label="Sponsors" className="mt-4 rounded-2xl border border-border p-3">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Sponsors
      </h2>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Diamond
      </p>
      <Link
        href="https://tracwell.app/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=right_sidebar"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/sponsors/tracwell-icon-light.svg"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 dark:hidden"
          />
          <Image
            src="/sponsors/tracwell-icon-dark.svg"
            alt=""
            width={40}
            height={40}
            className="hidden size-10 shrink-0 dark:block"
          />
          <div className="min-w-0">
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
              Tracwell
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Visitor insights for growth
            </p>
          </div>
        </div>
      </Link>
      <Link
        href="/sponsors"
        className="mt-4 flex items-center justify-between gap-2 rounded-sm text-xs font-medium text-foreground decoration-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Become a sponsor
        <ArrowRight aria-hidden="true" className="size-4 text-accent" />
      </Link>
    </section>
  );
}
