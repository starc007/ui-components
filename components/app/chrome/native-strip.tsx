"use client";

import { BorderBeam } from "border-beam";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useId } from "react";
import { ButtonLink } from "@/components/motion/button";
import styles from "./native-strip.module.css";

// beUI Pro for mobile presale. The price is set by hand in the Pro repo; update
// it here when the presale tier changes.
const PRESALE_PRICE = "$99";
const PRESALE_URL =
  "https://pro.beui.dev/mobile?utm_source=beui&utm_medium=referral&utm_campaign=mobile_presale&utm_content=strip";

/**
 * Site-wide announcement above the header: beUI Native is free, and points to
 * the beUI Pro for mobile presale. Its height is --announcement-h, which the
 * page and sidebars add to the header offset.
 */
export function NativeStrip() {
  const waveGradientId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <aside
      aria-label="beUI Pro for mobile presale"
      className="relative isolate flex h-(--announcement-h) items-center justify-center gap-x-2 border-b border-transparent bg-primary px-3 text-sm text-primary-foreground/80 sm:gap-x-3"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className={`${styles.wave} opacity-15`}
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
          className={`${styles.wave} ${styles.waveBack} opacity-10`}
        >
          <path fill={`url(#${waveGradientId})`} d="M0 30 Q180 70 360 30 T720 30 Q900 70 1080 30 T1440 30 V80 H0Z" />
        </svg>
      </div>
      <p className="truncate">
        <a
          href="/react-native"
          className="text-primary-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
        >
          beUI Native
        </a>{" "}
        is free
        <span className="hidden sm:inline">
          {" — "}
          <strong className="font-medium text-primary-foreground">
            Pro mobile blocks and screens
          </strong>{" "}
          are in presale from {PRESALE_PRICE}
        </span>
        <span className="sm:hidden"> · Pro presale</span>
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
          href={PRESALE_URL}
          variant="outline"
          size="sm"
          className="h-7 gap-1 rounded-full bg-background px-2.5 text-xs text-foreground hover:bg-background/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
        >
          Reserve<span className="sr-only"> beUI Pro for mobile</span>
          <ArrowRight aria-hidden className="size-3 shrink-0" />
        </ButtonLink>
      </BorderBeam>
    </aside>
  );
}
