import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";
import { INSTALLABLE_COUNT } from "@/lib/registry";
import styles from "./landing.module.css";

export function Hero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <a
        href="https://github.com/starc007/ui-components"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2.5 rounded-full border border-border px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-[#0285f7]"
        />
        Free & open source
        <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
        <span>{INSTALLABLE_COUNT} components</span>
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </a>

      <h1 className="mt-7 text-balance font-display text-[clamp(2.75rem,6.5vw,5rem)] font-medium leading-[1.04] tracking-[-0.055em] text-foreground">
        Make your interface
        <br />
        feel alive.
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
        Animated React components for the details people notice. Copy the
        source, make it yours, and bring a little more feel to your next build.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PressLink href="/components/motion" className={styles.primaryLink}>
          Explore components
          <ArrowRight aria-hidden="true" className="size-4" />
        </PressLink>
        <PressLink
          href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=hero"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.secondaryLink}
        >
          Explore Pro
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </PressLink>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        React · Next.js · Tailwind CSS · Motion
      </p>
    </div>
  );
}
