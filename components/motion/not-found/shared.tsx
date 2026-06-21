"use client";

import { motion, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface NotFoundProps {
  className?: string;
  /** The big status code. */
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
}

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Page not found",
  description:
    "The page you are looking for moved, vanished, or never existed.",
  homeHref: "/",
  homeLabel: "Back home",
  browseHref: "/components/motion",
  browseLabel: "Browse components",
} as const;

type ActionsProps = Pick<
  NotFoundProps,
  "homeHref" | "homeLabel" | "browseHref" | "browseLabel" | "className"
>;

/** The shared dual CTA: a primary "Back home" and a secondary "Browse". */
export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  className,
}: ActionsProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const whileTap = reduce ? undefined : { scale: 0.96 };
  const whileHover = reduce || !canHover ? undefined : { scale: 1.02 };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      <motion.a
        href={homeHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {homeLabel}
      </motion.a>
      <motion.a
        href={browseHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
      >
        {browseLabel}
      </motion.a>
    </div>
  );
}

/** Centers a variant and gives it a consistent minimum stage height. */
export function NotFoundStage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] w-full flex-col items-center justify-center gap-8 px-4 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
