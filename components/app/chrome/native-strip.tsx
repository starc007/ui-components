"use client";

import { BorderBeam } from "border-beam";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useId } from "react";
import { ButtonLink } from "@/components/motion/button";
import summary from "@/lib/native/summary.json";
import styles from "./native-strip.module.css";

/**
 * Site-wide announcement for beUI Native, above the header. Its height is
 * --announcement-h, which the page and sidebars add to the header offset.
 * The count includes variants, like the hero's.
 */
export function NativeStrip() {
  const waveGradientId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <aside
      aria-label="beUI Native announcement"
      className="relative isolate flex h-(--announcement-h) items-center justify-center gap-x-2 border-b border-border bg-background px-3 text-xs text-muted-foreground sm:gap-x-3"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className={`${styles.wave} opacity-35 dark:opacity-10`}
        >
          <defs>
            <linearGradient id={waveGradientId} gradientUnits="userSpaceOnUse" x1="0" x2="720" spreadMethod="repeat">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="20%" stopColor="#d1fae5" />
              <stop offset="40%" stopColor="#fef3c7" />
              <stop offset="60%" stopColor="#ffedd5" />
              <stop offset="80%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <path fill={`url(#${waveGradientId})`} d="M0 40 Q180 0 360 40 T720 40 Q900 0 1080 40 T1440 40 V80 H0Z" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className={`${styles.wave} ${styles.waveBack} opacity-20 dark:opacity-5`}
        >
          <path fill={`url(#${waveGradientId})`} d="M0 30 Q180 70 360 30 T720 30 Q900 70 1080 30 T1440 30 V80 H0Z" />
        </svg>
      </div>
      <p className="truncate">
        <span className="text-foreground">beUI Native</span> is here
        <span className="hidden sm:inline">
          {" — "}
          <strong className="font-medium text-foreground">
            {summary.variants} components
          </strong>{" "}
          for React Native, built for touch
        </span>
      </p>
      <BorderBeam
        active={!reduceMotion}
        className="inline-flex shrink-0 rounded-full"
        colorVariant="ocean"
        duration={4}
        size="sm"
        staticColors
        strength={0.65}
        theme="auto"
      >
        <ButtonLink
          href="/react-native"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 rounded-full bg-background px-2.5 text-xs text-foreground hover:bg-background/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Explore<span className="sr-only"> beUI Native</span>
          <ArrowRight aria-hidden className="size-3 shrink-0" />
        </ButtonLink>
      </BorderBeam>
    </aside>
  );
}
