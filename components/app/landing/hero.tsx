import { PressLink } from "@/components/app/press-link";
import summary from "@/lib/native/summary.json";
import { INSTALLABLE_COUNT } from "@/lib/registry";
import { HeroEyebrow } from "./hero-eyebrow";
import styles from "./landing.module.css";

// The CTA glow's powder blue and peach; on dark, translucent tints of them.
const react =
  "[--mark-bg:#d4eaf4] [--mark-fg:#0d3a50] dark:[--mark-bg:rgb(126_192_222/0.2)] dark:[--mark-fg:#cdebf7]";
const reactNative =
  "[--mark-bg:#f8dcc4] [--mark-fg:#4a2310] dark:[--mark-bg:rgb(244_178_124/0.2)] dark:[--mark-fg:#fbdcc3]";

export function Hero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <HeroEyebrow count={INSTALLABLE_COUNT} nativeCount={summary.variants} />

      <h1 className="mt-5 text-balance text-5xl font-medium tracking-tight md:text-6xl">
        Animated components
        <br />
        for <mark className={`${styles.mark} ${react}`}>React</mark> and{" "}
        <mark className={`${styles.mark} ${styles.markNative} ${reactNative}`}>
          React Native
        </mark>
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
        Copy-paste components for React and Next.js, built with Motion and
        Tailwind CSS. Now on React Native too. Free, open source, and fully
        customizable.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PressLink
          href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=hero"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.primaryLink}
        >
          Explore Pro
          <span className="sr-only"> (opens in a new tab)</span>
        </PressLink>
        <PressLink href="/components/motion" className={styles.secondaryLink}>
          Browse components
        </PressLink>
      </div>
    </div>
  );
}
