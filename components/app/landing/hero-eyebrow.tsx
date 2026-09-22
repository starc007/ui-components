"use client";

import { BorderBeam } from "border-beam";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { GithubIcon } from "@/components/app/icons";

export function HeroEyebrow({ count }: { count: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <BorderBeam
      active={!reduceMotion}
      className="inline-block max-w-full rounded-full"
      colorVariant="colorful"
      duration={3}
      size="md"
      staticColors
      strength={1}
      saturation={1.5}
      theme="auto"
    >
      <a
        href="https://github.com/starc007/ui-components"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <GithubIcon className="size-4 shrink-0 text-muted-foreground" />
        <span>
          <span className="font-medium">{count} components</span>
          <span className="text-muted-foreground">
            {" "}
            · Tailwind 4 + React 19
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </a>
    </BorderBeam>
  );
}
