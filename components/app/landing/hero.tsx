import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PressLink } from "@/components/app/press-link";
import { INSTALLABLE_COUNT } from "@/lib/registry";
import { HeroEyebrow } from "./hero-eyebrow";
import styles from "./landing.module.css";

export function Hero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <HeroEyebrow count={INSTALLABLE_COUNT} />

      <h1 className="mt-5 text-balance text-5xl font-medium tracking-tight md:text-6xl">
        Animated components
        <br />
        for React and Next.js
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
        Copy-paste React components built with Motion and Tailwind CSS. Free,
        open source, and fully customizable.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PressLink href="/components/motion" className={styles.primaryLink}>
          Browse components
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
    </div>
  );
}
